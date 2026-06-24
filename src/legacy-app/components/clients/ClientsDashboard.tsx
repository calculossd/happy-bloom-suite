import React, { useMemo } from 'react';
import type { Client, PrintOrder } from '../../types';
import { Users, UserCheck, Boxes, Receipt, TrendingUp, ShoppingCart } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 });

const SOURCE_LABEL: Record<string, string> = {
  PROSPECCAO: 'Prospecção',
  INSTAGRAM: 'Instagram',
  FACEBOOK: 'Facebook',
  VISITANDO: 'Visitando',
  INDICACAO: 'Indicação',
  OUTROS: 'Outros',
};

const SOURCE_COLORS = ['#b7ff00', '#E1306C', '#1877F2', '#F59E0B', '#22D3EE', '#94A3B8'];
const DEAL_COLORS = ['#b7ff00', '#F59E0B'];

function mapOrderStatus(o: PrintOrder): { label: string; cls: string } {
  const now = Date.now();
  if (o.status === 'DELIVERED') return { label: 'Entregue', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
  if (o.deadline && o.deadline < now) return { label: 'Atrasado', cls: 'bg-red-500/15 text-red-300 border-red-500/30' };
  if (o.status === 'PRINTING' || o.status === 'POST_PROCESS' || o.status === 'READY')
    return { label: 'Produzindo', cls: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' };
  return { label: 'Aguardando', cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
}

interface Props {
  clients: Client[];
  orders: PrintOrder[];
}

export const ClientsDashboard: React.FC<Props> = ({ clients, orders }) => {
  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const ordersThisMonth = orders.filter(o => o.createdAt >= monthStart);
    const revenueMonth = ordersThisMonth.reduce((s, o) => s + (o.priceCharged || 0), 0);
    const ticketMedio = ordersThisMonth.length ? revenueMonth / ordersThisMonth.length : 0;

    // Active clients: had an order in the last 60 days
    const cutoff = Date.now() - 60 * 24 * 3600 * 1000;
    const activeClientIds = new Set(
      orders.filter(o => o.createdAt >= cutoff && o.clientId != null).map(o => o.clientId as number)
    );

    const stockValueTotal = clients.reduce((s, c) => {
      const explicit = Number(c.stockValue) || 0;
      return s + explicit;
    }, 0);

    // Top clients by revenue (all-time)
    const revenueByClient = new Map<string, number>();
    for (const o of orders) {
      const key = o.clientName || 'Sem nome';
      revenueByClient.set(key, (revenueByClient.get(key) || 0) + (o.priceCharged || 0));
    }
    const topClients = [...revenueByClient.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Source pie
    const sourceCounts = new Map<string, number>();
    for (const c of clients) {
      const k = c.source || 'OUTROS';
      sourceCounts.set(k, (sourceCounts.get(k) || 0) + 1);
    }
    const sourceData = [...sourceCounts.entries()].map(([k, v]) => ({
      name: SOURCE_LABEL[k] || k, value: v,
    }));

    // Deal pie
    const consignados = clients.filter(c => c.dealType === 'CONSIGNADO').length;
    const compraram = clients.filter(c => (c.dealType ?? 'COMPROU') === 'COMPROU').length;
    const dealData = [
      { name: 'Compraram', value: compraram },
      { name: 'Consignados', value: consignados },
    ].filter(d => d.value > 0);

    const recentOrders = [...orders].sort((a, b) => b.createdAt - a.createdAt).slice(0, 8);

    return {
      total: clients.length,
      active: activeClientIds.size,
      stockValueTotal,
      ordersMonth: ordersThisMonth.length,
      revenueMonth,
      ticketMedio,
      topClients,
      sourceData,
      dealData,
      recentOrders,
    };
  }, [clients, orders]);

  const Kpi = ({ icon: Icon, label, value, sub }: any) => (
    <div className="p-3 bg-[#0C0E0D] border border-[#232B27] rounded-xl">
      <div className="flex items-center justify-between">
        <span className="text-[9px] uppercase tracking-wider text-[#8BA58D] font-bold">{label}</span>
        <Icon className="h-3.5 w-3.5 text-[#b7ff00]" />
      </div>
      <div className="text-lg font-bold text-[#F1F4EE] mt-1">{value}</div>
      {sub && <div className="text-[9px] text-[#8BA58D]">{sub}</div>}
    </div>
  );

  return (
    <div className="bg-[#151917] border border-[#232B27] p-5 rounded-2xl space-y-4" id="clients-dashboard">
      <div className="flex items-center gap-2 pb-2 border-b border-[#232B27]">
        <Users className="h-4 w-4 text-[#b7ff00]" />
        <h3 className="text-sm font-bold text-[#F1F4EE]">Dashboard — Clientes</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        <Kpi icon={Users} label="Cadastrados" value={stats.total} />
        <Kpi icon={UserCheck} label="Ativos (60d)" value={stats.active} />
        <Kpi icon={Boxes} label="Valor em Estoque" value={fmtBRL(stats.stockValueTotal)} sub="nos clientes" />
        <Kpi icon={ShoppingCart} label="Pedidos / mês" value={stats.ordersMonth} />
        <Kpi icon={Receipt} label="Faturamento mês" value={fmtBRL(stats.revenueMonth)} />
        <Kpi icon={TrendingUp} label="Ticket Médio" value={fmtBRL(stats.ticketMedio)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Clients */}
        <div className="p-3 bg-[#0C0E0D] border border-[#232B27] rounded-xl">
          <h4 className="text-[10px] uppercase font-bold text-[#8BA58D] mb-2">Top Clientes (valor total)</h4>
          {stats.topClients.length === 0 ? (
            <p className="text-[10px] text-[#8BA58D]">Sem pedidos registrados.</p>
          ) : (
            <ul className="space-y-1.5">
              {stats.topClients.map(([name, val], i) => (
                <li key={name} className="flex items-center justify-between text-[11px]">
                  <span className="text-[#F1F4EE] truncate">
                    <span className="text-[#b7ff00] font-bold mr-1">{i + 1}.</span>{name}
                  </span>
                  <span className="text-[#b7ff00] font-mono font-bold">{fmtBRL(val)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Source Pie */}
        <div className="p-3 bg-[#0C0E0D] border border-[#232B27] rounded-xl">
          <h4 className="text-[10px] uppercase font-bold text-[#8BA58D] mb-2">Origem do Cliente</h4>
          {stats.sourceData.length === 0 ? (
            <p className="text-[10px] text-[#8BA58D]">Sem dados de origem.</p>
          ) : (
            <div style={{ width: '100%', height: 180 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={stats.sourceData} dataKey="value" nameKey="name" outerRadius={60} label={{ fontSize: 10 }}>
                    {stats.sourceData.map((_, i) => (
                      <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0C0E0D', border: '1px solid #232B27', fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Deal Type Pie */}
        <div className="p-3 bg-[#0C0E0D] border border-[#232B27] rounded-xl">
          <h4 className="text-[10px] uppercase font-bold text-[#8BA58D] mb-2">Consignado vs Compra</h4>
          {stats.dealData.length === 0 ? (
            <p className="text-[10px] text-[#8BA58D]">Sem dados.</p>
          ) : (
            <div style={{ width: '100%', height: 180 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={stats.dealData} dataKey="value" nameKey="name" outerRadius={60} label={{ fontSize: 10 }}>
                    {stats.dealData.map((_, i) => (
                      <Cell key={i} fill={DEAL_COLORS[i % DEAL_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0C0E0D', border: '1px solid #232B27', fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};