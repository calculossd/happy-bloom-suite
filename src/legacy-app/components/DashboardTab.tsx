// @ts-nocheck
import React, { useState } from 'react';
import { Client, Printer, PrintOrder, FilamentStock, Expense, ShoppingItem } from '../types';
import { 
  DollarSign, 
  AlertTriangle, 
  TrendingUp, 
  Cpu, 
  ShoppingBag, 
  Plus, 
  Sparkles, 
  FileText, 
  RefreshCw, 
  Camera, 
  Clock, 
  Smartphone, 
  CheckCircle2, 
  MessageSquare,
  HelpCircle,
  Share2
} from 'lucide-react';
import { PrinterCameraModal } from './PrinterCameraModal';
import { ReferenceDashboardHero } from './ReferenceDashboardHero';

interface DashboardTabProps {
  orders: PrintOrder[];
  printers: Printer[];
  filamentStocks: FilamentStock[];
  expenses: Expense[];
  shoppingItems?: ShoppingItem[];
  clients?: Client[];
  onSelectTab: (tab: number) => void;
  onUpdatePrinter: (id: number, updated: Partial<Printer>) => void;
  onUpdateOrder?: (id: number, updated: Partial<PrintOrder>) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  orders,
  printers,
  filamentStocks,
  expenses,
  shoppingItems = [],
  clients = [],
  onSelectTab,
  onUpdatePrinter,
  onUpdateOrder
}) => {
  const [recentFeedback, setRecentFeedback] = useState<string | null>(null);
  const [selectedCameraPrinter, setSelectedCameraPrinter] = useState<Printer | null>(null);
  
  const handleRecalculate = () => {
    setRecentFeedback('Métricas sincronizadas em tempo real com o Ateliê!');
    setTimeout(() => setRecentFeedback(null), 3000);
  };

  // Month selector states
  const currentDate = new Date();
  const currentMonthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthKey); // Default to current month!

  // Helpers to parse Year-Month
  const getYearMonth = (timestamp: number) => {
    const d = new Date(timestamp);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const formatMonthLabel = (monthKey: string) => {
    if (monthKey === 'ALL') return 'Geral (Total)';
    const [year, month] = monthKey.split('-');
    const monthNames: Record<string, string> = {
      '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr', '05': 'Mai', '06': 'Jun',
      '07': 'Jul', '08': 'Ago', '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez'
    };
    return `${monthNames[month] || month}/${year}`;
  };

  // Calculations
  const safeOrders = orders || [];
  const safeExpenses = expenses || [];
  const safeShoppingItems = shoppingItems || [];
  const safePrinters = printers || [];
  const safeFilaments = filamentStocks || [];

  // Extract all available months having data to provide clicks on past months
  const availableMonths = Array.from(new Set([
    currentMonthKey,
    ...safeOrders.map(o => getYearMonth(o.createdAt || Date.now())),
    ...safeExpenses.map(e => getYearMonth(e.date || Date.now()))
  ])).sort().reverse();

  // Filter datasets based on selected month
  const filteredOrders = selectedMonth === 'ALL' 
    ? safeOrders 
    : safeOrders.filter(o => getYearMonth(o.createdAt) === selectedMonth);

  const filteredExpenses = selectedMonth === 'ALL'
    ? safeExpenses
    : safeExpenses.filter(e => getYearMonth(e.date) === selectedMonth);

  // Faturamento (Revenue) based on filtered orders
  const monthRevenue = filteredOrders
    .filter(o => o.status !== 'WAITING')
    .reduce((sum, o) => sum + o.priceCharged, 0);

  // Despesas (Expenses) based on filtered expenses
  const shoppingExpense = safeShoppingItems.reduce((sum, s) => sum + s.price, 0);
  const monthExpense = filteredExpenses.reduce((sum, e) => sum + (e.amount * e.qty), 0) + 
    (selectedMonth === currentMonthKey || selectedMonth === 'ALL' ? shoppingExpense : 0);

  const pendingRevenue = filteredOrders
    .filter(o => o.status === 'QUEUE' || o.status === 'PRINTING' || o.status === 'POST_PROCESS' || o.status === 'READY')
    .reduce((sum, o) => sum + o.priceCharged, 0);

  // ROI (Return on Investment) calculation
  const monthRoi = monthExpense > 0 ? ((monthRevenue - monthExpense) / monthExpense) * 100 : 0;

  // Valor a Comprar (Unchecked Shopping List items value)
  const valorAComprar = safeShoppingItems
    .filter(s => !s.isChecked)
    .reduce((sum, s) => sum + s.price, 0);

  // Order count metrics
  const parsedOpenOrdersCount = safeOrders.filter(o => o.status !== 'DELIVERED').length;
  const parsedDeliveredOrdersCount = filteredOrders.filter(o => o.status === 'DELIVERED').length;
  const parsedReadyToDeliverCount = safeOrders.filter(o => o.status === 'READY').length;

  // Profit Margin
  const monthProfitMargin = monthRevenue > 0 ? ((monthRevenue - monthExpense) / monthRevenue) * 100 : 0;

  // Active prints
  const activePrinters = safePrinters.filter(p => p.status === 'PRINTING');
  const alertFilaments = safeFilaments.filter(f => f.stockGrams < f.minStockGrams);

  // Sparkline data calculation
  const orderValues = filteredOrders.slice(-6).map(o => o.priceCharged);
  const maxOrderVal = Math.max(...orderValues, 100);

  // Monthly Calendar logic:
  const calendarActiveMonth = selectedMonth === 'ALL' ? currentMonthKey : selectedMonth;
  const [calYearStr, calMonthStr] = calendarActiveMonth.split('-');
  const calYear = parseInt(calYearStr);
  const calMonth = parseInt(calMonthStr) - 1; // 0-indexed month

  const totalDays = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayIndex = new Date(calYear, calMonth, 1).getDay(); // Day of week (0-6)

  const getDaySales = (day: number) => {
    const startOfDay = new Date(calYear, calMonth, day, 0, 0, 0).getTime();
    const endOfDay = new Date(calYear, calMonth, day, 23, 59, 59).getTime();
    
    return safeOrders
      .filter(o => o.createdAt >= startOfDay && o.createdAt <= endOfDay)
      .reduce((sum, o) => sum + o.priceCharged, 0);
  };

  return (
    <div className="space-y-6" id="dashboard_tab_container">

      {/* ===== REFERENCE DASHBOARD HERO (real data) ===== */}
      {(() => {
        const now = new Date();
        const y = now.getFullYear();
        const m = now.getMonth();
        const totalDays = new Date(y, m + 1, 0).getDate();
        const firstDayIndex = new Date(y, m, 1).getDay();
        const monthLabel = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        const daySalesMap: Record<number, number> = {};
        (orders || []).forEach((o: any) => {
          const d = o.deliveryDate || o.createdAt;
          if (!d) return;
          const dt = new Date(d);
          if (dt.getFullYear() === y && dt.getMonth() === m) {
            daySalesMap[dt.getDate()] = (daySalesMap[dt.getDate()] || 0) + (o.priceCharged || 0);
          }
        });
        const monthRevenue = (orders || [])
          .filter((o: any) => {
            const d = o.deliveryDate || o.createdAt;
            if (!d) return false;
            const dt = new Date(d);
            return dt.getFullYear() === y && dt.getMonth() === m;
          })
          .reduce((s: number, o: any) => s + (o.priceCharged || 0), 0);
        const monthExpense = (expenses || [])
          .filter((e: any) => {
            const d = e.date || e.createdAt;
            if (!d) return false;
            const dt = new Date(d);
            return dt.getFullYear() === y && dt.getMonth() === m;
          })
          .reduce((s: number, e: any) => s + (e.amount || e.value || 0), 0);
        const deliveredCount = (orders || []).filter((o: any) => o.status === 'DELIVERED').length;
        const openCount = (orders || []).filter((o: any) => o.status !== 'DELIVERED' && o.status !== 'CANCELED').length;
        const readyToDeliver = (orders || []).filter((o: any) => o.status === 'READY').length;
        const activePrinters = (printers || []).filter((p: any) => p.status === 'PRINTING').length;
        const alertFilaments = (filamentStocks || []).filter((f: any) => (f.quantity ?? 0) < (f.minQuantity ?? 0)).length;
        const monthProfitMargin = monthRevenue > 0 ? ((monthRevenue - monthExpense) / monthRevenue) * 100 : 0;
        const calendar = {
          totalDays,
          firstDayIndex,
          getDaySales: (d: number) => daySalesMap[d] || 0,
        };
        return (
          <ReferenceDashboardHero
            monthRevenue={monthRevenue}
            monthExpense={monthExpense}
            monthProfitMargin={monthProfitMargin}
            deliveredCount={deliveredCount}
            openCount={openCount}
            readyToDeliver={readyToDeliver}
            activePrinters={activePrinters}
            alertFilaments={alertFilaments}
            filaments={filamentStocks}
            orders={orders}
            allOrders={orders}
            clients={clients}
            printers={printers}
            calendar={calendar}
            monthLabel={monthLabel}
            onSelectTab={onSelectTab}
            onUpdatePrinter={onUpdatePrinter}
            onUpdateOrder={onUpdateOrder}
          />
        );
      })()}
      {false && (<ReferenceDashboardHero
        orders={orders}
        printers={printers}
        filamentStocks={filamentStocks}
        expenses={expenses}
        shoppingItems={shoppingItems}
        clients={clients}
        onSelectTab={onSelectTab}
        onUpdatePrinter={onUpdatePrinter}
        onUpdateOrder={onUpdateOrder}
      />)}

    </div>
  );
};