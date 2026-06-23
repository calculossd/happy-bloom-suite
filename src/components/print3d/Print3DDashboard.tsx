import { useMemo, useState } from "react";
import {
  LayoutDashboard, ShoppingCart, FileText, Users, Package, Printer as PrinterIcon,
  ListOrdered, Radio, Box, Layers, Wrench, Truck, Activity, Wallet, Receipt,
  BarChart3, TrendingDown, Settings, Search, Bell, MessageSquare, HelpCircle,
  ChevronDown, Calendar, Filter, Plus, DollarSign, Clock, Package2, ShoppingBag,
  Droplets, Thermometer, ChevronRight, TrendingUp, Cpu, FlaskConical,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar,
  PieChart, Pie, Cell,
} from "recharts";

const LIME = "#a3e635";
const LIME_DIM = "#84cc16";

/* ---------- Sidebar ---------- */
const NAV: Array<{ section?: string; items: Array<{ icon: any; label: string; badge?: string; active?: boolean }> }> = [
  { items: [{ icon: LayoutDashboard, label: "Dashboard", active: true }] },
  { section: "Principal", items: [
    { icon: ShoppingCart, label: "Pedidos", badge: "24" },
    { icon: FileText, label: "Orçamentos" },
    { icon: Users, label: "Clientes" },
    { icon: Package, label: "Produtos" },
  ]},
  { section: "Produção", items: [
    { icon: PrinterIcon, label: "Impressoras", badge: "6/7" },
    { icon: ListOrdered, label: "Fila de Impressão" },
    { icon: Radio, label: "Impressão ao Vivo" },
    { icon: Box, label: "Modelos 3D" },
  ]},
  { section: "Estoque", items: [
    { icon: Layers, label: "Filamentos", badge: "12" },
    { icon: Wrench, label: "Peças" },
    { icon: Truck, label: "Fornecedores" },
  ]},
  { section: "Financeiro", items: [
    { icon: Wallet, label: "Financeiro" },
    { icon: Receipt, label: "Faturamento" },
    { icon: BarChart3, label: "Relatórios" },
    { icon: TrendingDown, label: "Gastos" },
  ]},
  { section: "Configurações", items: [
    { icon: Settings, label: "Configurações" },
  ]},
];

function Sidebar() {
  return (
    <aside className="hidden lg:flex w-[240px] shrink-0 flex-col bg-[#0a0d0c] border-r border-white/[0.05] h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-2.5 border-b border-white/[0.05]">
        <div className="size-9 rounded-lg grid place-items-center" style={{ background: `linear-gradient(135deg, ${LIME}, ${LIME_DIM})`, boxShadow: `0 0 18px ${LIME}55` }}>
          <Box className="size-5 text-black" strokeWidth={2.5} />
        </div>
        <div className="leading-tight">
          <div className="text-[15px] font-bold tracking-tight text-white">PRINT3D</div>
          <div className="text-[9px] tracking-[0.18em] text-white/40 font-medium">MANUFATURA DIGITAL</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {NAV.map((group, gi) => (
          <div key={gi}>
            {group.section && (
              <div className="px-3 mb-2 text-[10px] tracking-[0.18em] font-semibold text-white/30">
                {group.section.toUpperCase()}
              </div>
            )}
            <ul className="space-y-0.5">
              {group.items.map((it, i) => {
                const Icon = it.icon;
                return (
                  <li key={i}>
                    <button
                      className={`group w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                        it.active
                          ? "text-black"
                          : "text-white/65 hover:text-white hover:bg-white/[0.04]"
                      }`}
                      style={it.active ? { background: LIME, boxShadow: `0 6px 20px -8px ${LIME}aa` } : undefined}
                    >
                      <Icon className="size-[17px]" strokeWidth={2} />
                      <span className="flex-1 text-left">{it.label}</span>
                      {it.badge && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                            it.active ? "bg-black/15 text-black" : "bg-[#ff7a45]/20 text-[#ff9466]"
                          }`}
                        >
                          {it.badge}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Upgrade card */}
      <div className="m-3 p-4 rounded-xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06]">
        <div className="text-[11px] text-white/50 tracking-wide">Plano Profissional</div>
        <div className="text-[12px] text-white/80 mt-0.5 mb-3">Expira em 25 dias</div>
        <button
          className="w-full py-2 rounded-lg text-[12px] font-bold text-black transition hover:brightness-110"
          style={{ background: LIME, boxShadow: `0 6px 18px -6px ${LIME}aa` }}
        >
          Fazer Upgrade
        </button>
      </div>
    </aside>
  );
}

/* ---------- Top bar ---------- */
function TopBar() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#0a0d0c]/80 border-b border-white/[0.05] px-6 py-3 flex items-center gap-4">
      <div className="flex-1 max-w-xl relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/35" />
        <input
          placeholder="Buscar pedidos, clientes, peças, orçamentos..."
          className="w-full pl-10 pr-4 py-2 text-[13px] rounded-lg bg-white/[0.03] border border-white/[0.06] text-white placeholder:text-white/35 focus:outline-none focus:border-white/15"
        />
      </div>
      <div className="ml-auto flex items-center gap-2">
        {[Bell, MessageSquare, HelpCircle].map((Ic, i) => (
          <button key={i} className="size-9 grid place-items-center rounded-lg hover:bg-white/[0.05] text-white/65 hover:text-white transition relative">
            <Ic className="size-[17px]" />
            {i === 0 && <span className="absolute top-2 right-2 size-1.5 rounded-full" style={{ background: LIME, boxShadow: `0 0 6px ${LIME}` }} />}
          </button>
        ))}
        <div className="ml-2 flex items-center gap-2.5 pl-3 border-l border-white/[0.06]">
          <div className="size-9 rounded-full grid place-items-center text-[12px] font-bold text-black" style={{ background: `linear-gradient(135deg,${LIME},${LIME_DIM})` }}>A</div>
          <div className="leading-tight">
            <div className="text-[12.5px] font-semibold text-white">Olá, Alex!</div>
            <div className="text-[10.5px] text-white/45">Administrador</div>
          </div>
          <ChevronDown className="size-3.5 text-white/40" />
        </div>
      </div>
    </header>
  );
}

/* ---------- Card primitive ---------- */
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-[#0f1311]/80 border border-white/[0.05] backdrop-blur-xl p-5 ${className}`} style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset, 0 18px 40px -24px rgba(0,0,0,0.7)" }}>
      {children}
    </div>
  );
}

/* ---------- KPI ---------- */
function Kpi({ label, value, delta, Icon }: { label: string; value: string; delta: string; Icon: any }) {
  return (
    <Card className="hover:border-white/[0.1] transition">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[12px] text-white/50">{label}</div>
          <div className="mt-3 text-[26px] font-bold tracking-tight text-white tabular-nums">{value}</div>
        </div>
        <div className="size-9 rounded-lg grid place-items-center bg-white/[0.04] border border-white/[0.05]">
          <Icon className="size-[17px]" style={{ color: LIME }} />
        </div>
      </div>
      <div className="mt-3 text-[11px] flex items-center gap-1.5" style={{ color: LIME }}>
        <TrendingUp className="size-3" />
        <span className="font-semibold">{delta}</span>
        <span className="text-white/40 font-normal">vs ontem</span>
      </div>
    </Card>
  );
}

/* ---------- Brazil map (stylized SVG) ---------- */
function BrazilMap() {
  const dots = [
    [60, 35], [62, 50], [70, 55], [55, 45], [45, 60], [50, 70], [58, 65],
    [65, 70], [48, 80], [38, 75], [42, 85], [55, 85], [60, 78], [70, 80],
    [50, 55], [65, 42], [40, 50], [52, 92], [62, 90], [33, 65],
  ];
  return (
    <div className="relative aspect-[4/3] w-full">
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
        {/* Simplified Brazil silhouette */}
        <path
          d="M 35,30 Q 45,22 55,25 L 70,28 Q 78,32 75,42 L 78,52 Q 75,60 68,62 L 70,72 Q 65,80 58,82 L 60,92 Q 52,96 45,92 L 38,88 Q 30,82 32,72 L 28,62 Q 25,52 30,45 Z"
          fill="rgba(163,230,53,0.04)"
          stroke="rgba(163,230,53,0.18)"
          strokeWidth="0.4"
        />
        {dots.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="2.4" fill={LIME} opacity="0.18" />
            <circle cx={x} cy={y} r="1" fill={LIME}>
              <animate attributeName="opacity" values="0.5;1;0.5" dur={`${2 + (i % 3)}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ---------- Live printers ---------- */
const PRINTERS = [
  { name: "Ender 3 S1",     material: "PLA — Preto",   remaining: "2h 15m restantes", pct: 65 },
  { name: "Bambu P1P",      material: "PETG — Branco", remaining: "1h 20m restantes", pct: 40 },
  { name: "Prusa MK4",      material: "ABS — Azul",    remaining: "3h 45m restantes", pct: 80 },
  { name: "Elegoo Neptune 4",material: "TPU — Verde",  remaining: "1h 10m restantes", pct: 25 },
  { name: "Anycubic Kobra 2",material: "ASA — Laranja",remaining: "2h 30m restantes", pct: 55 },
  { name: "Ender 5 Pro",    material: "PLA — Cinza",   remaining: "0h 50m restantes", pct: 15 },
];
function LivePrinters() {
  return (
    <Card>
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-[14px] font-semibold text-white">Impressão ao Vivo</h3>
      </div>
      <p className="text-[11px] text-white/45 mb-4">Acompanhe suas impressões em tempo real</p>
      <ul className="space-y-3">
        {PRINTERS.map((p, i) => (
          <li key={i} className="flex items-center gap-3 group">
            <div className="size-10 rounded-lg grid place-items-center bg-white/[0.03] border border-white/[0.05] shrink-0">
              <PrinterIcon className="size-5 text-white/70" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <div className="text-[12.5px] font-semibold text-white truncate">{p.name}</div>
                <div className="text-[11px] text-white/55 tabular-nums shrink-0">{p.remaining}</div>
              </div>
              <div className="text-[10.5px] text-white/40 mb-1">{p.material}</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 rounded-full bg-white/[0.05] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${p.pct}%`, background: `linear-gradient(90deg,${LIME_DIM},${LIME})`, boxShadow: `0 0 8px ${LIME}66` }} />
                </div>
                <div className="text-[10.5px] font-semibold tabular-nums w-9 text-right" style={{ color: LIME }}>{p.pct}%</div>
              </div>
            </div>
            <ChevronRight className="size-4 text-white/25 group-hover:text-white/60 transition" />
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ---------- Orders to deliver ---------- */
const ORDERS = [
  { id: "#1025", client: "João Silva",     city: "São Paulo - SP",     date: "25/11/2024", status: "Aguardando" },
  { id: "#1026", client: "Maria Santos",   city: "Rio de Janeiro - RJ",date: "25/11/2024", status: "Aguardando" },
  { id: "#1027", client: "Carlos Lima",    city: "Belo Horizonte - MG",date: "26/11/2024", status: "Em trânsito" },
  { id: "#1028", client: "Fernanda Costa", city: "Curitiba - PR",      date: "26/11/2024", status: "Aguardando" },
  { id: "#1029", client: "Rafael Souza",   city: "Porto Alegre - RS",  date: "27/11/2024", status: "Aguardando" },
];
function StatusPill({ s }: { s: string }) {
  const map: Record<string, string> = {
    "Aguardando": "bg-amber-400/10 text-amber-300 border-amber-400/20",
    "Em trânsito": "bg-sky-400/10 text-sky-300 border-sky-400/20",
    "Finalizado": "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
  };
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${map[s] || ""}`}>{s}</span>;
}
function OrdersList() {
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[14px] font-semibold text-white">Pedidos a Serem Entregues</h3>
        <button className="text-[11px] text-white/50 hover:text-white">Ver todos</button>
      </div>
      <ul className="divide-y divide-white/[0.04]">
        {ORDERS.map((o, i) => (
          <li key={i} className="grid grid-cols-[55px_1fr_auto_auto_auto] items-center gap-3 py-2.5 text-[12px]">
            <div className="font-mono text-white/55">{o.id}</div>
            <div className="text-white font-medium truncate">{o.client}</div>
            <div className="text-white/50 truncate hidden md:block">{o.city}</div>
            <div className="text-white/40 tabular-nums hidden md:block">{o.date}</div>
            <StatusPill s={o.status} />
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ---------- Humidity sensors ---------- */
const SENSORS = [
  { name: "Estoque Principal",   ur: 45, t: 24.3 },
  { name: "Estoque Filamentos",  ur: 48, t: 23.8 },
  { name: "Estoque Peças",       ur: 42, t: 24.1 },
  { name: "Estoque Resinas",     ur: 40, t: 23.2 },
];
function Sensors() {
  return (
    <Card>
      <h3 className="text-[14px] font-semibold text-white">Higrômetros ao Vivo</h3>
      <p className="text-[11px] text-white/45 mb-4">Umidade dos estoques</p>
      <ul className="space-y-3">
        {SENSORS.map((s, i) => (
          <li key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className="size-9 rounded-lg grid place-items-center" style={{ background: `${LIME}15`, border: `1px solid ${LIME}30` }}>
              <Droplets className="size-4" style={{ color: LIME }} />
            </div>
            <div className="flex-1 text-[12.5px] font-medium text-white">{s.name}</div>
            <div className="text-right">
              <div className="text-[13px] font-bold tabular-nums" style={{ color: LIME }}>{s.ur}% <span className="text-white/40 font-normal text-[10px]">UR</span></div>
              <div className="text-[10px] text-white/45 tabular-nums">{s.t}°C</div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ---------- STL gallery ---------- */
const STL = [
  { name: "Suporte PS5",  date: "23/11/2024", mat: "PETG — Preto" },
  { name: "Organizador Cabos", date: "22/11/2024", mat: "PLA — Branco" },
  { name: "Engrenagem",   date: "22/11/2024", mat: "PETG — Azul" },
  { name: "Miniatura Dragon", date: "20/11/2024", mat: "Resina — Cinza" },
  { name: "Vaso Decorativo", date: "19/11/2024", mat: "PLA — Verde" },
];
function StlGallery() {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-white">Últimos STL Criados / Impressos</h3>
        <button className="text-[11px] text-white/50 hover:text-white">Ver todos</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {STL.map((s, i) => (
          <div key={i} className="group cursor-pointer">
            <div className="aspect-square rounded-xl bg-gradient-to-br from-white/[0.05] to-white/[0.01] border border-white/[0.05] grid place-items-center mb-2 group-hover:border-white/15 transition relative overflow-hidden">
              <Box className="size-10 text-white/30 group-hover:scale-110 transition" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition" style={{ background: `radial-gradient(circle at center, ${LIME}15, transparent 70%)` }} />
            </div>
            <div className="text-[11.5px] font-medium text-white truncate">{s.name}</div>
            <div className="text-[10px] text-white/40 tabular-nums">{s.date}</div>
            <div className="text-[10px] text-white/40">{s.mat}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ---------- Critical stock ---------- */
const CRIT = [
  { name: "PLA Preto", qty: "1.2kg", level: "Crítico" },
  { name: "PETG Branco", qty: "0.8kg", level: "Crítico" },
  { name: "ABS Azul", qty: "1.5kg", level: "Atenção" },
  { name: "TPU Flex", qty: "0.6kg", level: "Crítico" },
  { name: "ASA Laranja", qty: "1.0kg", level: "Atenção" },
];
function CriticalStock() {
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[14px] font-semibold text-white">Estoque Crítico</h3>
        <button className="text-[11px] text-white/50 hover:text-white">Ver todos</button>
      </div>
      <ul className="space-y-2">
        {CRIT.map((c, i) => (
          <li key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.03] transition">
            <div className="size-8 rounded bg-white/[0.04] grid place-items-center"><Layers className="size-4 text-white/55" /></div>
            <div className="flex-1">
              <div className="text-[12px] font-medium text-white">{c.name}</div>
              <div className="text-[10px] text-white/40 tabular-nums">{c.qty}</div>
            </div>
            <span className={`text-[10px] font-semibold ${c.level === "Crítico" ? "text-rose-400" : "text-amber-300"}`}>{c.level}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ---------- Filament quotes ---------- */
const QUOTES = [
  { name: "PLA",  price: "R$ 79,90", change: "+2%", up: true  },
  { name: "PETG", price: "R$ 99,90", change: "-5%", up: false },
  { name: "ABS",  price: "R$ 109,90", change: "+1%", up: true  },
  { name: "TPU",  price: "R$ 139,90", change: "+3%", up: true  },
  { name: "ASA",  price: "R$ 119,90", change: "0%",  up: true  },
];
function FilamentQuotes() {
  return (
    <Card>
      <h3 className="text-[14px] font-semibold text-white">Cotação de Filamentos</h3>
      <p className="text-[11px] text-white/45 mb-4">Atualizado hoje às 10:30</p>
      <ul className="space-y-2.5">
        {QUOTES.map((q, i) => (
          <li key={i} className="flex items-center gap-3 text-[12.5px]">
            <div className="size-7 rounded bg-white/[0.04] grid place-items-center"><Layers className="size-3.5 text-white/60" /></div>
            <div className="flex-1 font-semibold text-white">{q.name}</div>
            <div className="text-white/70 tabular-nums">{q.price} <span className="text-white/35 text-[10px]">/kg</span></div>
            <div className={`text-[11px] font-semibold tabular-nums w-10 text-right ${q.up ? "text-emerald-400" : "text-rose-400"}`}>{q.change}</div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ---------- AI pricing ---------- */
function AiPricing() {
  const data = [{ name: "m", value: 69 }, { name: "r", value: 31 }];
  return (
    <Card>
      <h3 className="text-[14px] font-semibold text-white">IA de Precificação</h3>
      <p className="text-[11px] text-white/45 mb-4">Baseado no mercado e histórico</p>
      <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-4">
        <div>
          <div className="text-[10px] text-white/45">Custo atual</div>
          <div className="text-[18px] font-bold text-white tabular-nums">R$ 12,37</div>
        </div>
        <div>
          <div className="text-[10px] text-white/45">Preço sugerido</div>
          <div className="text-[18px] font-bold tabular-nums" style={{ color: LIME }}>R$ 39,90</div>
        </div>
        <div className="relative size-[78px]">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data} dataKey="value" innerRadius={26} outerRadius={36} startAngle={90} endAngle={-270} stroke="none">
                <Cell fill={LIME} />
                <Cell fill="rgba(255,255,255,0.06)" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="text-[13px] font-bold tabular-nums" style={{ color: LIME }}>69%</div>
              <div className="text-[8px] text-white/40">ideal</div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/[0.04]">
        {[
          { l: "Demanda",      v: "Alta",   c: LIME },
          { l: "Concorrência", v: "Média",  c: "#fbbf24" },
          { l: "Tendência",    v: "Alta",   c: LIME },
        ].map((x, i) => (
          <div key={i}>
            <div className="text-[10px] text-white/40">{x.l}</div>
            <div className="text-[12px] font-semibold flex items-center gap-1.5" style={{ color: x.c }}>
              <span className="size-1.5 rounded-full" style={{ background: x.c }} />{x.v}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ---------- Bar chart: top categories ---------- */
function CategoriesChart() {
  const data = [
    { name: "Peças Técnicas", v: 35 },
    { name: "Decoração",      v: 25 },
    { name: "Acessórios",     v: 18 },
    { name: "Organização",    v: 12 },
    { name: "Outros",         v: 10 },
  ];
  return (
    <Card>
      <h3 className="text-[14px] font-semibold text-white">Categorias Mais Vendidas</h3>
      <p className="text-[11px] text-white/45 mb-4">Com base nos últimos 30 dias</p>
      <div className="space-y-3">
        {data.map((d, i) => (
          <div key={i}>
            <div className="flex justify-between text-[11.5px] mb-1">
              <span className="text-white/75">{d.name}</span>
              <span className="tabular-nums font-semibold" style={{ color: LIME }}>{d.v}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${(d.v / 35) * 100}%`, background: `linear-gradient(90deg,${LIME_DIM},${LIME})`, boxShadow: `0 0 6px ${LIME}55` }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ---------- Area chart: prints per hour ---------- */
function HourlyChart() {
  const data = useMemo(() => Array.from({ length: 24 }, (_, h) => {
    const peak = Math.exp(-Math.pow((h - 13) / 5, 2)) * 4;
    return { h: `${String(h).padStart(2, "0")}:00`, v: +(peak + Math.random() * 0.6).toFixed(2) };
  }), []);
  return (
    <Card>
      <h3 className="text-[14px] font-semibold text-white">Impressões por Hora (Hoje)</h3>
      <p className="text-[11px] text-white/45 mb-3">Total de horas de impressão por hora</p>
      <div className="h-[180px] -mx-2">
        <ResponsiveContainer>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={LIME} stopOpacity={0.45} />
                <stop offset="100%" stopColor={LIME} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="h" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} ticks={["00:00","04:00","08:00","12:00","16:00","20:00","23:00"]} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip contentStyle={{ background: "#0f1311", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 11 }} labelStyle={{ color: "#fff" }} />
            <Area type="monotone" dataKey="v" stroke={LIME} strokeWidth={2} fill="url(#g1)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

/* ---------- Financial summary ---------- */
function FinanceSummary() {
  const data = [{ v: 82 }, { v: 18 }];
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-white">Resumo Financeiro</h3>
        <button className="text-[11px] text-white/50 hover:text-white">Ver todos</button>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
        <ul className="space-y-3">
          {[
            { ic: Receipt, l: "Faturamento (mês)", v: "R$ 128.450,00", d: "+28%", c: "text-emerald-400" },
            { ic: TrendingDown, l: "Gastos (mês)",     v: "R$ 22.780,00",  d: "-8%",  c: "text-rose-400" },
            { ic: TrendingUp,   l: "Lucro líquido (mês)", v: "R$ 105.670,00", d: "+35%", c: "text-emerald-400" },
          ].map((r, i) => {
            const Ic = r.ic;
            return (
              <li key={i} className="flex items-center gap-3 text-[12.5px]">
                <div className="size-8 rounded bg-white/[0.04] grid place-items-center"><Ic className="size-4 text-white/60" /></div>
                <div className="flex-1 text-white/70">{r.l}</div>
                <div className="text-white font-semibold tabular-nums">{r.v}</div>
                <div className={`w-10 text-right text-[11px] font-semibold tabular-nums ${r.c}`}>{r.d}</div>
              </li>
            );
          })}
        </ul>
        <div className="relative size-[110px]">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data} dataKey="v" innerRadius={38} outerRadius={52} startAngle={90} endAngle={-270} stroke="none">
                <Cell fill={LIME} />
                <Cell fill="rgba(255,255,255,0.06)" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="text-[20px] font-bold tabular-nums" style={{ color: LIME }}>82%</div>
              <div className="text-[9px] text-white/45">Margem de<br/>lucro</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ---------- PANEL (embeddable in legacy app) ---------- */
export function Print3DPanel() {
  return (
    <div className="space-y-5 text-white">
      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-[22px] font-bold tracking-tight text-white">Bem-vindo de volta, Alex! <span className="inline-block">👋</span></h1>
              <p className="text-[12.5px] text-white/45">Aqui está o resumo da sua produção hoje.</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[12px] text-white/75 hover:bg-white/[0.06]">
                <Calendar className="size-3.5" /> Hoje, 23 Nov <ChevronDown className="size-3" />
              </button>
              <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[12px] text-white/75 hover:bg-white/[0.06]">
                <Filter className="size-3.5" /> Filtros <ChevronDown className="size-3" />
              </button>
              <button
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12px] font-bold text-black hover:brightness-110 transition"
                style={{ background: LIME, boxShadow: `0 6px 18px -6px ${LIME}aa` }}
              >
                <Plus className="size-3.5" strokeWidth={2.8} /> Novo Pedido
              </button>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            <Kpi label="Pedidos Hoje"        value="47"          delta="+12%" Icon={ShoppingBag} />
            <Kpi label="Faturamento Hoje"    value="R$ 3.892,50" delta="+18%" Icon={DollarSign} />
            <Kpi label="Peças Impressas"     value="156"         delta="+9%"  Icon={Package2} />
            <Kpi label="Horas de Impressão"  value="32h 45m"     delta="+14%" Icon={Clock} />
            <Kpi label="Gastos Hoje"         value="R$ 842,30"   delta="+6%"  Icon={Wallet} />
          </div>

          {/* Row 2: Map | Live printers | Orders | Sensors */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card>
              <h3 className="text-[14px] font-semibold text-white">Mapa de Clientes (Balcão)</h3>
              <p className="text-[11px] text-white/45 mb-2">Clientes atendidos via balcão</p>
              <BrazilMap />
            </Card>
            <LivePrinters />
            <OrdersList />
            <Sensors />
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="md:col-span-2"><StlGallery /></div>
            <CriticalStock />
            <FilamentQuotes />
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <CategoriesChart />
            <HourlyChart />
            <FinanceSummary />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-1 gap-4">
            <AiPricing />
          </div>
    </div>
  );
}

/* ---------- STANDALONE (with sidebar/topbar) ---------- */
export default function Print3DDashboard() {
  return (
    <div className="min-h-screen bg-[#050908] text-white flex">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar />
        <main className="flex-1 p-6"><Print3DPanel /></main>
      </div>
    </div>
  );
}