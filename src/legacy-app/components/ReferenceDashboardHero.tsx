// @ts-nocheck
import React from 'react';
import { Briefcase, CalendarDays, ArrowUpRight, Plus, MoreHorizontal, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Reference-faithful Dashboard hero — mirrors the uploaded design:
 *  - Inline KPI badges next to the big "Dashboard" title
 *  - Colorful project-style cards grid (mapped to recent orders)
 *  - Mini calendar with colored day cells
 *  - "Projects this year" stats + "Yearly profit" bar chart with neon-lime bars
 */

const CARD_PALETTE = [
  { name: 'blue',    bg: 'linear-gradient(155deg, #3956D8 0%, #2B3FB0 100%)', tag: '#A9BDFF' },
  { name: 'orange',  bg: 'linear-gradient(155deg, #E0762B 0%, #B4571A 100%)', tag: '#FFD9B0' },
  { name: 'purple',  bg: 'linear-gradient(155deg, #9A3DB4 0%, #6E2A82 100%)', tag: '#F1BFFA' },
  { name: 'green',   bg: 'linear-gradient(155deg, #1F7E55 0%, #135A3C 100%)', tag: '#B6F0CF' },
  { name: 'red',     bg: 'linear-gradient(155deg, #D8484A 0%, #A3302F 100%)', tag: '#FFC9C7' },
  { name: 'teal',    bg: 'linear-gradient(155deg, #1F8C8E 0%, #126668 100%)', tag: '#B4F0EE' },
];

const CATEGORY_TAGS = ['#Finance', '#Education', '#Finance', '#Healthcare', '#Travel', '#Studio'];

function MiniAvatars({ count = 3, seed = 0 }) {
  const items = Array.from({ length: Math.min(count, 4) });
  return (
    <div className="flex -space-x-2">
      {items.map((_, i) => (
        <div
          key={i}
          className="h-6 w-6 rounded-full ring-2 ring-black/40"
          style={{
            background: `linear-gradient(135deg, hsl(${(seed * 47 + i * 80) % 360} 60% 55%), hsl(${(seed * 47 + i * 80 + 40) % 360} 70% 40%))`,
          }}
        />
      ))}
      {count > 4 && (
        <div className="h-6 w-6 rounded-full bg-white/15 ring-2 ring-black/40 grid place-items-center text-[9px] font-bold text-white">
          +{count - 4}
        </div>
      )}
    </div>
  );
}

export const ReferenceDashboardHero: React.FC<any> = ({
  monthRevenue,
  deliveredCount,
  openCount,
  orders,
  calendar,
  monthLabel,
  onSelectTab,
}) => {
  // Build "project cards" from the most recent N orders, fall back to demo set
  const sourceOrders = (orders || []).slice(-6).reverse();
  const cards = (sourceOrders.length >= 6 ? sourceOrders : [
    ...sourceOrders,
    ...Array.from({ length: 6 - sourceOrders.length }).map((_, i) => ({
      id: `demo-${i}`,
      productName: ['Decem App', 'SkyLux', 'DushMash', 'Biofarm', 'PAD move', 'NovaPrint'][i + sourceOrders.length] || 'Projeto',
      priceCharged: [391991, 51792, 31955, 11538, 21688, 81234][i + sourceOrders.length] || 9999,
      tasks: [988, 12, 32, 19, 35, 88][i + sourceOrders.length] || 10,
    })),
  ]).slice(0, 6);

  // Build year-month profit bars from full orders (12 months window ending at current)
  const months = Array.from({ length: 8 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (7 - i));
    return { key: d.toLocaleString('en-US', { month: 'short' }), idx: d.getMonth(), year: d.getFullYear(), value: 0 };
  });
  (orders || []).forEach((o: any) => {
    const d = new Date(o.createdAt || Date.now());
    const slot = months.find(m => m.idx === d.getMonth() && m.year === d.getFullYear());
    if (slot) slot.value += o.priceCharged || 0;
  });
  if (months.every(m => m.value === 0)) {
    [4000, 7000, 5500, 9800, 12500, 8200, 6800, 14200].forEach((v, i) => { months[i].value = v; });
  }
  const maxBar = Math.max(...months.map(m => m.value), 1);
  const peakIdx = months.reduce((maxI, m, i, arr) => (m.value > arr[maxI].value ? i : maxI), 0);

  // Mini calendar grid
  const { year, month, totalDays, firstDayIndex, getDaySales } = calendar;
  const cells: Array<{ day: number | null; hasEvent: boolean; tint: string }> = [];
  for (let i = 0; i < firstDayIndex; i++) cells.push({ day: null, hasEvent: false, tint: '' });
  for (let d = 1; d <= totalDays; d++) {
    const sales = getDaySales(d);
    const tints = ['#3956D8', '#E0762B', '#9A3DB4', '#1F7E55', '#D8484A', '#1F8C8E'];
    cells.push({ day: d, hasEvent: sales > 0, tint: tints[d % tints.length] });
  }
  // pad to 6 rows
  while (cells.length % 7 !== 0) cells.push({ day: null, hasEvent: false, tint: '' });

  const fmtBRL = (v: number) => `R$ ${v.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;

  return (
    <section className="relative">
      {/* ===== Title row with inline KPI badges ===== */}
      <div className="flex flex-wrap items-center gap-6 mb-6">
        <h1
          className="font-black tracking-tight text-white"
          style={{ fontSize: 'clamp(2.4rem, 1.6rem + 2.8vw, 4rem)', lineHeight: 0.95, letterSpacing: '-0.03em' }}
        >
          Dashboard
        </h1>

        <div className="flex flex-wrap items-center gap-4 ml-auto">
          <InlineKpi
            icon={<Briefcase className="h-5 w-5 text-white" strokeWidth={2} />}
            big={fmtBRL(monthRevenue)}
            badge="+14% mês"
            sub="Faturamento total do período"
          />
          <InlineKpi
            icon={<CalendarDays className="h-5 w-5 text-white" strokeWidth={2} />}
            big={`+${deliveredCount}`}
            badge={`+${openCount} hoje`}
            sub="Pedidos concluídos no período"
          />
        </div>
      </div>

      {/* ===== Projects grid (left, ~2/3) + Calendar (right, ~1/3) ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6 mb-6">
        {/* Projects */}
        <div
          className="relative rounded-[28px] p-6 border border-white/[0.06]"
          style={{ background: 'linear-gradient(180deg, rgba(17,28,40,0.85), rgba(10,18,28,0.75))' }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-baseline gap-2">
              <h2 className="text-2xl font-bold text-white">Projects</h2>
              <span className="text-sm text-white/40">{`{${cards.length * 14 + 4}}`}</span>
            </div>
            <div className="flex items-center gap-2 text-white/50">
              <button className="h-8 w-8 grid place-items-center rounded-full hover:bg-white/5"><MoreHorizontal className="h-4 w-4" /></button>
              <button className="h-8 w-8 grid place-items-center rounded-full hover:bg-white/5"><SlidersHorizontal className="h-4 w-4" /></button>
              <button onClick={() => onSelectTab(3)} className="h-8 w-8 grid place-items-center rounded-full hover:bg-white/5"><ArrowUpRight className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {/* "Add" tile */}
            <button
              onClick={() => onSelectTab(3)}
              className="aspect-[1.45] rounded-2xl border border-dashed border-white/10 hover:border-[#A5D84B]/40 hover:bg-white/[0.02] grid place-items-center transition group"
            >
              <Plus className="h-7 w-7 text-white/30 group-hover:text-[#A5D84B] transition" />
            </button>

            {cards.map((c: any, i: number) => {
              const p = CARD_PALETTE[i % CARD_PALETTE.length];
              return (
                <div
                  key={c.id || i}
                  className="relative aspect-[1.45] rounded-2xl p-4 overflow-hidden cursor-pointer hover:-translate-y-0.5 transition"
                  style={{ background: p.bg, boxShadow: '0 18px 40px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)' }}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-[11px] font-semibold" style={{ color: p.tag }}>
                      {CATEGORY_TAGS[i % CATEGORY_TAGS.length]}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-white/70" />
                  </div>
                  <div className="mt-1 text-lg font-bold text-white truncate">{c.productName || `Projeto ${i + 1}`}</div>
                  <div className="mt-0.5 text-[11px] text-white/60">
                    Tarefas concluídas: <span className="text-white/85">{c.tasks ?? Math.max(1, Math.floor(((c.priceCharged || 100) % 90) + 1))}</span>
                  </div>
                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
                    <div className="font-bold text-white tabular leading-none" style={{ fontSize: '1.1rem' }}>
                      {fmtBRL(c.priceCharged || 0)}
                    </div>
                    <MiniAvatars count={3 + (i % 3)} seed={i + 1} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Calendar */}
        <div
          className="relative rounded-[28px] p-5 border border-white/[0.06]"
          style={{ background: 'linear-gradient(180deg, rgba(17,28,40,0.85), rgba(10,18,28,0.75))' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-baseline gap-2">
              <h2 className="text-2xl font-bold text-white">Calendar</h2>
              <span className="text-sm text-white/40">{`{${monthLabel}}`}</span>
            </div>
            <div className="flex items-center gap-1 text-white/50">
              <button className="h-8 w-8 grid place-items-center rounded-full hover:bg-white/5"><SlidersHorizontal className="h-4 w-4" /></button>
              <button className="h-8 w-8 grid place-items-center rounded-full hover:bg-white/5"><ArrowUpRight className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {cells.map((c, i) => (
              <div
                key={i}
                className={`relative aspect-square rounded-xl grid place-items-center text-[12px] font-semibold transition ${
                  c.day === null ? 'opacity-30' : 'hover:bg-white/[0.04]'
                }`}
                style={{
                  background: c.day === null ? 'transparent' : 'rgba(255,255,255,0.015)',
                  border: c.hasEvent ? `1px solid ${c.tint}55` : '1px solid rgba(255,255,255,0.04)',
                }}
              >
                <span className="text-white/70">{c.day ?? ''}</span>
                {c.hasEvent && (
                  <div
                    className="absolute bottom-1 h-3.5 w-3.5 rounded-full ring-2 ring-black/40"
                    style={{ background: `linear-gradient(135deg, ${c.tint}, ${c.tint}99)` }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Stats card (left) + Yearly profit bar chart (right) ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_2fr] gap-6">
        {/* Stats */}
        <div
          className="relative rounded-[28px] p-6 border border-white/[0.06]"
          style={{ background: 'linear-gradient(180deg, rgba(17,28,40,0.85), rgba(10,18,28,0.75))' }}
        >
          <div className="flex items-start justify-between">
            <h2 className="text-xl font-bold text-white">Projetos este ano</h2>
            <button className="h-8 w-8 grid place-items-center rounded-full text-white/50 hover:bg-white/5"><ArrowUpRight className="h-4 w-4" /></button>
          </div>
          <StatRow label="Valor médio por pedido" value={fmtBRL(monthRevenue / Math.max(1, deliveredCount || 1))} delta="vs mês anterior" color="#A5D84B" />
          <StatRow label="Pedidos no período" value={String(deliveredCount + openCount)} delta="abertos + concluídos" color="#A5D84B" />
          <StatRow label="Novos projetos" value={String(openCount)} delta="aguardando produção" color="#A5D84B" />
        </div>

        {/* Yearly profit bars */}
        <div
          className="relative rounded-[28px] p-6 border border-white/[0.06] overflow-hidden"
          style={{ background: 'linear-gradient(180deg, rgba(17,28,40,0.85), rgba(10,18,28,0.75))' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-baseline gap-2">
              <h2 className="text-2xl font-bold text-white">Lucro do ano</h2>
              <span className="text-sm text-white/40">{`{28%}`}</span>
            </div>
            <div className="flex items-center gap-2 text-white/50">
              <button className="h-8 w-8 grid place-items-center rounded-full hover:bg-white/5"><SlidersHorizontal className="h-4 w-4" /></button>
              <button className="h-8 w-8 grid place-items-center rounded-full hover:bg-white/5"><ArrowUpRight className="h-4 w-4" /></button>
            </div>
          </div>
          {/* Month tabs */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto">
            {months.map((m, i) => (
              <div
                key={m.key + i}
                className={`px-4 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap border transition ${
                  i === peakIdx
                    ? 'border-white/15 text-white bg-white/[0.04]'
                    : 'border-white/8 text-white/60'
                }`}
              >
                {m.key}
              </div>
            ))}
          </div>
          {/* Tooltip over peak */}
          <div className="relative pl-2 pr-2">
            <div className="absolute left-1/2 -translate-x-1/2 -top-1 flex items-center gap-3 z-10" style={{ left: `${(peakIdx + 0.5) * (100 / months.length)}%` }}>
              <div className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/10 text-[10px] text-white/70 font-mono">Tarefas {Math.round(months[peakIdx].value / 35)}</div>
              <div className="px-2.5 py-1 rounded-md bg-[#A5D84B] text-black text-[11px] font-bold">{fmtBRL(months[peakIdx].value)}</div>
            </div>
            {/* Bars */}
            <div className="grid grid-cols-8 gap-3 h-[180px] items-end mt-6">
              {months.map((m, i) => {
                const isPeak = i === peakIdx;
                const h = Math.max(14, (m.value / maxBar) * 100);
                return (
                  <div key={i} className="relative h-full flex items-end">
                    <div
                      className="w-full rounded-[14px] transition-all"
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
            {/* Carousel arrows */}
            <div className="flex items-center justify-end gap-2 mt-3 text-white/40">
              <button className="h-7 w-7 grid place-items-center rounded-full hover:bg-white/5"><ChevronLeft className="h-4 w-4" /></button>
              <button className="h-7 w-7 grid place-items-center rounded-full hover:bg-white/5"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

function InlineKpi({ icon, big, badge, sub }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-11 w-11 rounded-full grid place-items-center bg-white/[0.04] border border-white/[0.08]">
        {icon}
      </div>
      <div className="leading-tight">
        <div className="flex items-center gap-2">
          <span className="text-white text-[22px] font-bold tabular">{big}</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#A5D84B]/15 text-[#A5D84B] border border-[#A5D84B]/30">
            {badge}
          </span>
        </div>
        <div className="text-[11px] text-white/45 mt-0.5">{sub}</div>
      </div>
    </div>
  );
}

function StatRow({ label, value, delta, color }: any) {
  return (
    <div className="mt-5">
      <div className="text-[12px] text-white/55 font-medium">{label}</div>
      <div className="flex items-baseline gap-3 mt-1">
        <div className="text-[28px] font-bold tabular" style={{ color }}>{value}</div>
        <div className="text-[11px] text-white/40">{delta}</div>
      </div>
    </div>
  );
}

export default ReferenceDashboardHero;