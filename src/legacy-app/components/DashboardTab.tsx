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

      {/* ===== REFERENCE LAYOUT — DASHBOARD HERO (matches uploaded design) ===== */}
      <ReferenceDashboardHero
        monthRevenue={monthRevenue}
        deliveredCount={parsedDeliveredOrdersCount}
        openCount={parsedOpenOrdersCount}
        orders={filteredOrders}
        allOrders={safeOrders}
        clients={clients}
        printers={safePrinters}
        activePrinters={activePrinters.length}
        alertFilaments={alertFilaments.length}
        filaments={safeFilaments}
        monthExpense={monthExpense}
        monthProfitMargin={monthProfitMargin}
        pendingRevenue={pendingRevenue}
        readyToDeliver={parsedReadyToDeliverCount}
        calendar={{ year: calYear, month: calMonth, totalDays, firstDayIndex, getDaySales }}
        monthLabel={formatMonthLabel(selectedMonth)}
        onSelectTab={onSelectTab}
      />

    </div>
  );
};