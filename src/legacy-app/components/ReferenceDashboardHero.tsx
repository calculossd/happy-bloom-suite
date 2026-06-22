// @ts-nocheck
import React from 'react';
import {
  Briefcase, CalendarDays, ArrowUpRight, MoreHorizontal, SlidersHorizontal,
  ChevronLeft, ChevronRight, Activity, GitPullRequest, Users as UsersIcon,
  Layers, ShoppingBag, Settings as SettingsIcon, Cpu, Package,
} from 'lucide-react';

/**
 * Dashboard hero matching the uploaded reference.
 * - Compact inline KPIs next to the big "Dashboard" title
 * - Colorful module cards (Produção, Pedidos, Clientes, Gestão, Histórico, Ajustes)
 * - Mini calendar with the day's revenue inline
 * - Year-profit bars with neon-lime peak
 */

const fmtBRL = (v: number) => `R$ ${(v || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;
const fmtBRLk = (v: number) => v >= 1000 ? `R$ ${(v / 1000).toFixed(1)}k` : `R$ ${Math.round(v)}`;

export const ReferenceDashboardHero: React.FC<any> = (props) => {
  const {
    monthRevenue = 0, deliveredCount = 0, openCount = 0,
    orders = [], allOrders = [], clients = [], printers = [],
    activePrinters = 0, alertFilaments = 0, filaments = [],
    monthExpense = 0, monthProfitMargin = 0, pendingRevenue = 0, readyToDeliver = 0,
    calendar, monthLabel, onSelectTab,
  } = props;

  // ===== Module cards (replace the demo Projects grid) =====
  const modules = [
    {
      tab: 1, tag: '#Produção', name: 'Fila de Impressão',
      stat: `${activePrinters}/${printers.length} ativas`,
      value: `${alertFilaments} filamentos críticos`,
      bg: 'linear-gradient(155deg, #3956D8 0%, #2B3FB0 100%)', tag_c: '#A9BDFF',
      icon: Cpu,
    },
    {
      tab: 3, tag: '#Pedidos', name: 'Pedidos Abertos',
      stat: `${openCount} em aberto`,
      value: `${readyToDeliver} prontos para entrega`,
      bg: 'linear-gradient(155deg, #E0762B 0%, #B4571A 100%)', tag_c: '#FFD9B0',
      icon: GitPullRequest,
    },
    {
      tab: 2, tag: '#Clientes', name: 'Base de Clientes',
      stat: `${clients.length} cadastrados`,
      value: `${new Set(orders.map((o: any) => o.clientId)).size} ativos no mês`,
      bg: 'linear-gradient(155deg, #9A3DB4 0%, #6E2A82 100%)', tag_c: '#F1BFFA',
      icon: UsersIcon,
    },
    {
      tab: 4, tag: '#Gestão', name: 'Financeiro',
      stat: `${monthProfitMargin.toFixed(1)}% margem`,
      value: fmtBRL(monthRevenue - monthExpense) + ' lucro',
      bg: 'linear-gradient(155deg, #1F7E55 0%, #135A3C 100%)', tag_c: '#B6F0CF',
      icon: Layers,
    },
    {
      tab: 6, tag: '#Histórico', name: 'Pedidos Entregues',
      stat: `${deliveredCount} concluídos`,
      value: fmtBRL(pendingRevenue) + ' a receber',
      bg: 'linear-gradient(155deg, #D8484A 0%, #A3302F 100%)', tag_c: '#FFC9C7',
      icon: ShoppingBag,
    },
    {
      tab: 4, tag: '#Estoque', name: 'Filamentos',
      stat: `${filaments.length} bobinas`,
      value: `${alertFilaments} abaixo do mínimo`,
      bg: 'linear-gradient(155deg, #1F8C8E 0%, #126668 100%)', tag_c: '#B4F0EE',
      icon: Package,
    },
  ];

  // ===== Year-profit bars =====
  const months = Array.from({ length: 8 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (7 - i));
    return { key: d.toLocaleString('pt-BR', { month: 'short' }).replace('.', ''), idx: d.getMonth(), year: d.getFullYear(), value: 0 };
  });
  (allOrders || []).forEach((o: any) => {
    const d = new Date(o.createdAt || Date.now());
    const slot = months.find(m => m.idx === d.getMonth() && m.year === d.getFullYear());
    if (slot) slot.value += o.priceCharged || 0;
  });
  if (months.every(m => m.value === 0)) [4000, 7000, 5500, 9800, 12500, 8200, 6800, 14200].forEach((v, i) => { months[i].value = v; });
  const maxBar = Math.max(...months.map(m => m.value), 1);
  const peakIdx = months.reduce((mx, m, i, a) => (m.value > a[mx].value ? i : mx), 0);

  // ===== Calendar =====
  const { totalDays, firstDayIndex, getDaySales } = calendar;
  const cells: Array<{ day: number | null; sales: number }> = [];
  for (let i = 0; i < firstDayIndex; i++) cells.push({ day: null, sales: 0 });
  for (let d = 1; d <= totalDays; d++) cells.push({ day: d, sales: getDaySales(d) });
  while (cells.length % 7 !== 0) cells.push({ day: null, sales: 0 });

  return (
    <section className="relative">
      {/* ===== Title row with COMPACT inline KPI badges ===== */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 mb-5 sm:flex sm:flex-wrap sm:justify-between">
        <h1
          className="font-black tracking-tight text-white truncate"
          style={{ fontSize: 'clamp(2rem, 1.4rem + 2.4vw, 3.4rem)', lineHeight: 0.95, letterSpacing: '-0.03em' }}
        >
          Dashboard
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <CompactKpi icon={<Briefcase className="h-4 w-4" />} big={fmtBRLk(monthRevenue)} badge="+14%" sub="Faturamento" />
          <CompactKpi icon={<CalendarDays className="h-4 w-4" />} big={`+${deliveredCount}`} badge={`+${openCount}`} sub="Pedidos" />
        </div>
      </div>

      {/* ===== Modules grid (left, ~2/3) + Calendar (right, ~1/3) ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-5 mb-5">
        {/* Modules */}
        <Panel>
          <PanelHead title="Módulos" tag={`{${modules.length}}`} onOpen={() => onSelectTab(1)} />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {modules.map((m, i) => (
              <button
                key={i}
                onClick={() => onSelectTab(m.tab)}
                className="relative text-left aspect-[1.45] rounded-2xl p-4 overflow-hidden hover:-translate-y-0.5 transition group"
                style={{ background: m.bg, boxShadow: '0 18px 40px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)' }}
              >
                <div className="flex items-start justify-between">
                  <span className="text-[11px] font-semibold" style={{ color: m.tag_c }}>{m.tag}</span>
                  <ArrowUpRight className="h-4 w-4 text-white/70 group-hover:text-white transition" />
                </div>
                <div className="mt-1 text-[15px] font-bold text-white leading-tight">{m.name}</div>
                <div className="mt-0.5 text-[11px] text-white/65">{m.stat}</div>
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
                  <div className="text-white font-bold tabular leading-none text-[13px] truncate">{m.value}</div>
                  <m.icon className="h-5 w-5 text-white/80 shrink-0" strokeWidth={2} />
                </div>
              </button>
            ))}
          </div>
        </Panel>

        {/* Calendar */}
        <Panel>
          <PanelHead title="Calendário" tag={`{${monthLabel}}`} />
          <div className="grid grid-cols-7 gap-1.5">
            {['D','S','T','Q','Q','S','S'].map((d, i) => (
              <div key={i} className="text-center text-[9px] font-bold text-white/30 uppercase pb-1">{d}</div>
            ))}
            {cells.map((c, i) => {
              const hot = c.sales > 0;
              return (
                <div
                  key={i}
                  className={`relative aspect-square rounded-lg p-1 flex flex-col justify-between text-[10px] ${
                    c.day === null ? 'opacity-20' : ''
                  }`}
                  style={{
                    background: hot ? 'rgba(165,216,75,0.10)' : 'rgba(255,255,255,0.015)',
                    border: hot ? '1px solid rgba(165,216,75,0.32)' : '1px solid rgba(255,255,255,0.04)',
                    boxShadow: hot ? 'inset 0 0 12px rgba(165,216,75,0.10)' : 'none',
                  }}
                >
                  <span className={hot ? 'text-white font-bold' : 'text-white/55'}>{c.day ?? ''}</span>
                  {hot && (
                    <span className="text-[9px] font-bold leading-none text-[#C7F26B] tabular truncate">
                      {c.sales >= 1000 ? `${(c.sales / 1000).toFixed(1)}k` : `${Math.round(c.sales)}`}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] text-white/45">
            <span>Venda do dia · neon = ativo</span>
            <span className="text-[#A5D84B] font-bold">{fmtBRLk(monthRevenue)} no mês</span>
          </div>
        </Panel>
      </div>

      {/* ===== Stats (left) + Yearly profit (right) ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_2fr] gap-5">
        <Panel>
          <div className="flex items-start justify-between">
            <h2 className="text-lg font-bold text-white">Projetos este ano</h2>
            <IconBtn><ArrowUpRight className="h-4 w-4" /></IconBtn>
          </div>
          <StatRow label="Ticket médio" value={fmtBRL(monthRevenue / Math.max(1, deliveredCount || 1))} delta="por pedido entregue" />
          <StatRow label="Pedidos no período" value={String(deliveredCount + openCount)} delta="abertos + concluídos" />
          <StatRow label="Novos pedidos" value={String(openCount)} delta="aguardando produção" />
        </Panel>

        <Panel>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-baseline gap-2">
              <h2 className="text-lg font-bold text-white">Lucro do ano</h2>
              <span className="text-xs text-white/40">{`{${monthProfitMargin.toFixed(0)}%}`}</span>
            </div>
            <div className="flex items-center gap-1">
              <IconBtn><SlidersHorizontal className="h-4 w-4" /></IconBtn>
              <IconBtn><ArrowUpRight className="h-4 w-4" /></IconBtn>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
            {months.map((m, i) => (
              <div
                key={m.key + i}
                className={`px-3 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap border ${
                  i === peakIdx ? 'border-white/15 text-white bg-white/[0.04]' : 'border-white/[0.06] text-white/55'
                }`}
              >
                {m.key}
              </div>
            ))}
          </div>
          <div className="relative">
            <div className="absolute -top-1 z-10 flex items-center gap-2" style={{ left: `${(peakIdx + 0.5) * (100 / months.length)}%`, transform: 'translateX(-50%)' }}>
              <div className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/10 text-[9px] text-white/65 font-mono">Tarefas {Math.round(months[peakIdx].value / 35)}</div>
              <div className="px-2 py-0.5 rounded-md bg-[#A5D84B] text-black text-[10px] font-bold">{fmtBRLk(months[peakIdx].value)}</div>
            </div>
            <div className="grid grid-cols-8 gap-3 h-[160px] items-end mt-4">
              {months.map((m, i) => {
                const isPeak = i === peakIdx;
                const h = Math.max(14, (m.value / maxBar) * 100);
                return (
                  <div key={i} className="relative h-full flex items-end">
                    <div
                      className="w-full rounded-[12px] transition-all"
                      style={{
                        height: `${h}%`,
                        background: isPeak
                          ? 'linear-gradient(180deg, #C7F26B 0%, #A5D84B 100%)'
                          : 'linear-gradient(180deg, rgba(165,216,75,0.12) 0%, rgba(165,216,75,0.04) 100%)',
                        border: isPeak ? '1px solid rgba(199,242,107,0.6)' : '1px solid rgba(165,216,75,0.10)',
                        boxShadow: isPeak
                          ? '0 0 40px -4px rgba(165,216,75,0.55), inset 0 1px 0 rgba(255,255,255,0.3)'
                          : 'inset 0 1px 0 rgba(255,255,255,0.03)',
                      }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-end gap-2 mt-2 text-white/40">
              <IconBtn><ChevronLeft className="h-4 w-4" /></IconBtn>
              <IconBtn><ChevronRight className="h-4 w-4" /></IconBtn>
            </div>
          </div>
        </Panel>
      </div>
    </section>
  );
};

function Panel({ children }: any) {
  return (
    <div
      className="relative rounded-[24px] p-5 border border-white/[0.06]"
      style={{ background: 'linear-gradient(180deg, rgba(17,28,40,0.85), rgba(10,18,28,0.75))' }}
    >
      {children}
    </div>
  );
}

function PanelHead({ title, tag, onOpen }: any) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-baseline gap-2 min-w-0">
        <h2 className="text-xl font-bold text-white truncate">{title}</h2>
        <span className="text-xs text-white/40">{tag}</span>
      </div>
      <div className="flex items-center gap-1 text-white/50 shrink-0">
        <IconBtn><MoreHorizontal className="h-4 w-4" /></IconBtn>
        <IconBtn><SlidersHorizontal className="h-4 w-4" /></IconBtn>
        {onOpen && <IconBtn onClick={onOpen}><ArrowUpRight className="h-4 w-4" /></IconBtn>}
      </div>
    </div>
  );
}

function IconBtn({ children, onClick }: any) {
  return (
    <button onClick={onClick} className="h-7 w-7 grid place-items-center rounded-full text-white/50 hover:bg-white/5 hover:text-white transition">
      {children}
    </button>
  );
}

function CompactKpi({ icon, big, badge, sub }: any) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.07]">
      <div className="h-7 w-7 rounded-full grid place-items-center bg-white/[0.04] border border-white/[0.08] text-white">
        {icon}
      </div>
      <div className="leading-tight">
        <div className="flex items-center gap-1.5">
          <span className="text-white text-[14px] font-bold tabular">{big}</span>
          <span className="px-1.5 py-px rounded-full text-[9px] font-bold bg-[#A5D84B]/15 text-[#A5D84B] border border-[#A5D84B]/30">{badge}</span>
        </div>
        <div className="text-[9px] uppercase tracking-wider text-white/40">{sub}</div>
      </div>
    </div>
  );
}

function StatRow({ label, value, delta }: any) {
  return (
    <div className="mt-4">
      <div className="text-[11px] text-white/55 font-medium">{label}</div>
      <div className="flex items-baseline gap-2 mt-0.5">
        <div className="text-[22px] font-bold tabular text-[#A5D84B]">{value}</div>
        <div className="text-[10px] text-white/40">{delta}</div>
      </div>
    </div>
  );
}

export default ReferenceDashboardHero;