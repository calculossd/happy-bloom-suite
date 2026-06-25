import React, { useMemo } from 'react';
import type { CatalogItem } from '../types';
import { BookOpen, Package, DollarSign, Boxes, TrendingUp, Sparkles, Layers, AlertTriangle } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 });

interface Props { catalogItems: CatalogItem[]; }

export const CatalogoDashboard: React.FC<Props> = ({ catalogItems }) => {
  const stats = useMemo(() => {
    const total = catalogItems.length;
    const totalUnits = catalogItems.reduce((s, c) => s + (c.stockCount || 0), 0);
    const inventoryValue = catalogItems.reduce((s, c) => s + (c.stockCount || 0) * (c.defaultPrice || 0), 0);
    const avgPrice = total ? catalogItems.reduce((s, c) => s + (c.defaultPrice || 0), 0) / total : 0;
    const noStock = catalogItems.filter(c => (c.stockCount || 0) === 0).length;
    const withImage = catalogItems.filter(c => !!c.imageUrl).length;
    const withSTL = catalogItems.filter(c => !!c.stlFileName).length;

    const byType = new Map<string, number>();
    for (const c of catalogItems) {
      const k = c.filamentType || 'OUTROS';
      byType.set(k, (byType.get(k) || 0) + 1);
    }
    const typeDist = [...byType.entries()].map(([name, value]) => ({ name, value }));

    const topPriced = [...catalogItems]
      .sort((a, b) => (b.defaultPrice || 0) - (a.defaultPrice || 0))
      .slice(0, 6)
      .map(c => ({ name: c.name.length > 18 ? c.name.slice(0, 16) + '…' : c.name, price: c.defaultPrice || 0 }));

    return { total, totalUnits, inventoryValue, avgPrice, noStock, withImage, withSTL, typeDist, topPriced };
  }, [catalogItems]);

  const PIE = ['#A78BFA', '#22D3EE', '#34D399', '#F59E0B', '#F472B6', '#60A5FA'];

  const KPI = ({ icon: Icon, label, value, accent, glow }: any) => (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-4 backdrop-blur-xl">
      <div className={`pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full ${glow} blur-3xl`} />
      <div className="relative flex items-center gap-1.5 text-[9px] uppercase tracking-[0.26em] text-white/45">
        <Icon className={`h-3 w-3 ${accent}`} /> {label}
      </div>
      <div className={`relative mt-1.5 text-2xl font-semibold tabular-nums ${accent}`}>{value}</div>
    </div>
  );

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-transparent p-6 md:p-8 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2">
      <div className="pointer-events-none absolute -top-24 -right-24 h-[320px] w-[320px] rounded-full bg-violet-500/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-[280px] w-[280px] rounded-full bg-fuchsia-500/10 blur-[120px]" />

      <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.32em] text-white/60">
            <Sparkles className="h-3 w-3 text-violet-300" /> Vitrine
          </div>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-white" style={{ fontFamily: "'Sora', sans-serif" }}>
            Catálogo <span className="bg-gradient-to-r from-violet-300 via-fuchsia-200 to-white bg-clip-text text-transparent">Inteligente</span>
          </h2>
          <p className="mt-1.5 max-w-xl text-sm text-white/55">Saúde do portfólio comercial em tempo real — preço médio, cobertura e composição.</p>
        </div>
      </div>

      <div className="relative grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KPI icon={BookOpen} label="Produtos" value={stats.total} accent="text-violet-200" glow="bg-violet-500/15" />
        <KPI icon={Boxes} label="Unidades" value={stats.totalUnits} accent="text-cyan-200" glow="bg-cyan-500/15" />
        <KPI icon={DollarSign} label="Valor em Estoque" value={fmtBRL(stats.inventoryValue)} accent="text-emerald-200" glow="bg-emerald-500/15" />
        <KPI icon={TrendingUp} label="Ticket Médio" value={fmtBRL(stats.avgPrice)} accent="text-amber-200" glow="bg-amber-500/15" />
      </div>

      <div className="relative grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <div className="text-[9px] uppercase tracking-[0.24em] text-white/45 flex items-center gap-1.5"><AlertTriangle className="h-3 w-3 text-rose-300" /> Sem estoque</div>
          <div className={`mt-1 text-xl font-semibold tabular-nums ${stats.noStock > 0 ? 'text-rose-200' : 'text-emerald-200'}`}>{stats.noStock}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <div className="text-[9px] uppercase tracking-[0.24em] text-white/45 flex items-center gap-1.5"><Package className="h-3 w-3 text-sky-300" /> Com imagem</div>
          <div className="mt-1 text-xl font-semibold tabular-nums text-sky-200">{stats.withImage}/{stats.total}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <div className="text-[9px] uppercase tracking-[0.24em] text-white/45 flex items-center gap-1.5"><Layers className="h-3 w-3 text-fuchsia-300" /> Com STL</div>
          <div className="mt-1 text-xl font-semibold tabular-nums text-fuchsia-200">{stats.withSTL}/{stats.total}</div>
        </div>
      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-[10px] uppercase tracking-[0.28em] text-white/50 mb-3">Composição por Material</div>
          {stats.typeDist.length === 0 ? (
            <div className="h-[220px] grid place-items-center text-xs text-white/40">Sem dados</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={stats.typeDist} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                  {stats.typeDist.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-[10px] uppercase tracking-[0.28em] text-white/50 mb-3">Top Preços</div>
          {stats.topPriced.length === 0 ? (
            <div className="h-[220px] grid place-items-center text-xs text-white/40">Sem dados</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.topPriced} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 11 }} formatter={(v: any) => fmtBRL(Number(v))} />
                <Bar dataKey="price" fill="#A78BFA" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogoDashboard;
