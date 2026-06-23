import { useEffect, useMemo, useRef, useState } from "react";
import {
  LayoutDashboard, ShoppingCart, FileText, Users, Package, Printer as PrinterIcon,
  ListOrdered, Radio, Box, Layers, Wrench, Truck, Activity, Wallet, Receipt,
  BarChart3, TrendingDown, Settings, Search, Bell, MessageSquare, HelpCircle,
  ChevronDown, Calendar, Filter, Plus, DollarSign, Clock, Package2, ShoppingBag,
  Droplets, Thermometer, ChevronRight, TrendingUp, Cpu, FlaskConical,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar,
  PieChart, Pie, Cell, LabelList,
} from "recharts";
import { FilamentSpool, materialColor } from "@/legacy-app/components/FilamentSpool";

// Color name → hex swatch for filament color chips
const COLOR_HEX: Record<string, string> = {
  preto: "#111", black: "#111",
  branco: "#f5f5f5", white: "#f5f5f5",
  cinza: "#9ca3af", gray: "#9ca3af",
  vermelho: "#ef4444", red: "#ef4444",
  laranja: "#f97316", orange: "#f97316",
  amarelo: "#facc15", yellow: "#facc15",
  verde: "#22c55e", green: "#22c55e",
  azul: "#3b82f6", blue: "#3b82f6",
  roxo: "#a855f7", purple: "#a855f7",
  rosa: "#ec4899", pink: "#ec4899",
  marrom: "#92400e", brown: "#92400e",
  dourado: "#d4a017", gold: "#d4a017",
  prata: "#c0c0c0", silver: "#c0c0c0",
  transparente: "rgba(255,255,255,0.25)", transparent: "rgba(255,255,255,0.25)",
};
function colorHex(name?: string) {
  if (!name) return "#9ca3af";
  return COLOR_HEX[String(name).toLowerCase().trim()] || "#9ca3af";
}

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

/* ---------- Real Leaflet map with client geocoding ---------- */
const GEOCODE_CACHE_KEY = "print3d_geocode_cache_v1";
function loadGeocodeCache(): Record<string, { lat: number; lng: number } | null> {
  try {
    return JSON.parse(localStorage.getItem(GEOCODE_CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}
function saveGeocodeCache(c: Record<string, { lat: number; lng: number } | null>) {
  try { localStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(c)); } catch {}
}
function normalizeQuery(addr: string) {
  // Use last 2 segments (cidade, estado) for better match
  const parts = addr.split(",").map((s) => s.trim()).filter(Boolean);
  const tail = parts.slice(-3).join(", ");
  return (tail || addr).trim();
}
async function geocodeOne(q: string): Promise<{ lat: number; lng: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${encodeURIComponent(q)}`;
  try {
    const r = await fetch(url, { headers: { Accept: "application/json" } });
    const j = await r.json();
    if (Array.isArray(j) && j[0]) return { lat: parseFloat(j[0].lat), lng: parseFloat(j[0].lon) };
  } catch {}
  return null;
}

function ClientsMap({ clients = [] }: { clients?: any[] }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  // Init Leaflet once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      // CSS via CDN (Tailwind v4 disallows remote @import)
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }
      if (cancelled || !ref.current || mapRef.current) return;
      const map = L.map(ref.current, {
        center: [-14.235, -51.9253], zoom: 4, zoomControl: true, attributionControl: false,
      });
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
      }).addTo(map);
      mapRef.current = map;
      layerRef.current = L.layerGroup().addTo(map);
      setReady(true);
    })();
    return () => {
      cancelled = true;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, []);

  // Geocode + render markers
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      const cache = loadGeocodeCache();
      const points: Array<{ lat: number; lng: number; name: string }> = [];
      const queries = Array.from(
        new Set(
          clients
            .map((c: any) => normalizeQuery(c.address || ""))
            .filter((q) => q && q.length > 2),
        ),
      );
      // Geocode missing ones sequentially (Nominatim rate limit ~1 req/s)
      for (const q of queries) {
        if (cancelled) return;
        if (!(q in cache)) {
          cache[q] = await geocodeOne(q);
          saveGeocodeCache(cache);
          await new Promise((r) => setTimeout(r, 1100));
        }
      }
      clients.forEach((c: any) => {
        const q = normalizeQuery(c.address || "");
        const p = cache[q];
        if (p) points.push({ ...p, name: c.name || "Cliente" });
      });
      if (cancelled) return;
      layerRef.current.clearLayers();
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:14px;height:14px;border-radius:9999px;background:${LIME};box-shadow:0 0 10px ${LIME}aa;border:2px solid #0a0d0c"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      points.forEach((p) => {
        L.marker([p.lat, p.lng], { icon }).bindTooltip(p.name).addTo(layerRef.current);
      });
      if (points.length) {
        const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
        mapRef.current.fitBounds(bounds.pad(0.3), { maxZoom: 8 });
      }
    })();
    return () => { cancelled = true; };
  }, [ready, clients]);

  return <div ref={ref} className="aspect-[4/3] w-full rounded-lg overflow-hidden border border-white/[0.05]" />;
}

/* ---------- Live printers ---------- */
const STATUS_LABEL: Record<string, string> = {
  PRINTING: "Imprimindo",
  IDLE: "Ociosa",
  MAINTENANCE: "Manutenção",
};
function LivePrinters({ printers = [], orders = [] }: { printers?: any[]; orders?: any[] }) {
  const rows = (printers.length ? printers : []).slice(0, 6).map((p: any) => {
    const activeOrder = orders.find(
      (o: any) => o.assignedPrinterId === p.id && (o.status === "PRINTING" || o.status === "QUEUE"),
    );
    const pct = Math.round(((p.printProgress ?? (activeOrder?.printingProgress ?? 0)) || 0) * (p.printProgress > 1 ? 1 : 100));
    const material = activeOrder
      ? `${activeOrder.filamentType} — ${activeOrder.filamentColor}`
      : STATUS_LABEL[p.status] || "—";
    const remainingH = activeOrder ? activeOrder.printTimeHours * (1 - (activeOrder.printingProgress || 0)) : 0;
    const remaining = activeOrder
      ? `${Math.floor(remainingH)}h ${Math.round((remainingH % 1) * 60)}m restantes`
      : (p.status === "PRINTING" ? "em andamento" : "—");
    return { name: p.name || p.model, material, remaining, pct: Math.max(0, Math.min(100, pct)) };
  });
  return (
    <Card>
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-[14px] font-semibold text-white">Impressão ao Vivo</h3>
        <span className="text-[10px] text-white/45 tabular-nums">
          {printers.filter((p: any) => p.status === "PRINTING").length}/{printers.length} ativas
        </span>
      </div>
      <p className="text-[11px] text-white/45 mb-4">Acompanhe suas impressões em tempo real</p>
      {rows.length === 0 && (
        <div className="text-[12px] text-white/40 py-6 text-center">Nenhuma impressora cadastrada.</div>
      )}
      <ul className="space-y-3">
        {rows.map((p, i) => (
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

function StatusPill({ s }: { s: string }) {
  const map: Record<string, string> = {
    "Aguardando": "bg-amber-400/10 text-amber-300 border-amber-400/20",
    "Em trânsito": "bg-sky-400/10 text-sky-300 border-sky-400/20",
    "Pronto": "bg-sky-400/10 text-sky-300 border-sky-400/20",
    "Imprimindo": "bg-violet-400/10 text-violet-300 border-violet-400/20",
    "Fila": "bg-white/[0.05] text-white/65 border-white/10",
    "Finalizado": "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
  };
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${map[s] || ""}`}>{s}</span>;
}
const ORDER_STATUS_LABEL: Record<string, string> = {
  WAITING: "Aguardando",
  QUEUE: "Fila",
  PRINTING: "Imprimindo",
  POST_PROCESS: "Em trânsito",
  READY: "Pronto",
  DELIVERED: "Finalizado",
};
function OrdersList({ orders = [], clients = [], onSelectTab }: { orders?: any[]; clients?: any[]; onSelectTab?: (t: number) => void }) {
  const rows = orders
    .filter((o: any) => o.status !== "DELIVERED")
    .slice()
    .sort((a: any, b: any) => (a.deadline || 0) - (b.deadline || 0))
    .slice(0, 6);
  const cityById: Record<number, string> = {};
  clients.forEach((c: any) => (cityById[c.id] = (c.address || "").split(",").pop()?.trim() || ""));
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[14px] font-semibold text-white">Pedidos a Serem Entregues</h3>
        <button className="text-[11px] text-white/50 hover:text-white" onClick={() => onSelectTab?.(3)}>Ver todos</button>
      </div>
      {rows.length === 0 && (
        <div className="text-[12px] text-white/40 py-6 text-center">Sem pedidos pendentes.</div>
      )}
      <ul className="divide-y divide-white/[0.04]">
        {rows.map((o: any) => (
          <li key={o.id} className="grid grid-cols-[55px_1fr_auto_auto] items-center gap-3 py-2.5 text-[12px]">
            <div className="font-mono text-white/55">#{o.id}</div>
            <div className="text-white font-medium truncate">{o.clientName || "—"}</div>
            <div className="text-white/40 tabular-nums hidden md:block">
              {o.deadline ? new Date(o.deadline).toLocaleDateString("pt-BR") : "—"}
            </div>
            <StatusPill s={ORDER_STATUS_LABEL[o.status] || o.status} />
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ---------- Filament stock health (replaces sensors) ---------- */
function Sensors({ filaments = [] }: { filaments?: any[] }) {
  const grouped: Record<string, { total: number; min: number; count: number }> = {};
  filaments.forEach((f: any) => {
    const k = f.type || "—";
    if (!grouped[k]) grouped[k] = { total: 0, min: 0, count: 0 };
    grouped[k].total += f.stockGrams || 0;
    grouped[k].min += f.minStockGrams || 0;
    grouped[k].count += 1;
  });
  const rows = Object.entries(grouped).slice(0, 5);
  return (
    <Card>
      <h3 className="text-[14px] font-semibold text-white">Saúde do Estoque</h3>
      <p className="text-[11px] text-white/45 mb-4">Filamentos por tipo</p>
      {rows.length === 0 && (
        <div className="text-[12px] text-white/40 py-6 text-center">Sem estoque cadastrado.</div>
      )}
      <ul className="space-y-3">
        {rows.map(([type, g], i) => (
          <li key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className="size-9 rounded-lg grid place-items-center" style={{ background: `${LIME}15`, border: `1px solid ${LIME}30` }}>
              <Droplets className="size-4" style={{ color: LIME }} />
            </div>
            <div className="flex-1 text-[12.5px] font-medium text-white">{type} <span className="text-white/40 text-[10px]">({g.count})</span></div>
            <div className="text-right">
              <div className="text-[13px] font-bold tabular-nums" style={{ color: g.total < g.min ? "#fb7185" : LIME }}>
                {(g.total / 1000).toFixed(2)}kg
              </div>
              <div className="text-[10px] text-white/45 tabular-nums">min {(g.min / 1000).toFixed(1)}kg</div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ---------- STL gallery (recent orders) ---------- */
function StlGallery({ orders = [] }: { orders?: any[] }) {
  const items = orders
    .slice()
    .sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 5)
    .map((o: any) => ({
      name: o.itemName,
      date: o.createdAt ? new Date(o.createdAt).toLocaleDateString("pt-BR") : "",
      mat: `${o.filamentType} — ${o.filamentColor}`,
    }));
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-white">Últimas Peças Impressas</h3>
        <button className="text-[11px] text-white/50 hover:text-white">Ver todos</button>
      </div>
      {items.length === 0 && (
        <div className="text-[12px] text-white/40 py-6 text-center">Sem peças recentes.</div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {items.map((s, i) => (
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
function CriticalStock({ filaments = [], onSelectTab }: { filaments?: any[]; onSelectTab?: (t: number) => void }) {
  const items = filaments
    .filter((f: any) => f.stockGrams < f.minStockGrams * 1.5)
    .slice()
    .sort((a: any, b: any) => a.stockGrams / Math.max(1, a.minStockGrams) - b.stockGrams / Math.max(1, b.minStockGrams))
    .slice(0, 6)
    .map((f: any) => ({
      name: `${f.type} ${f.color}`,
      type: f.type,
      color: f.color,
      qty: `${(f.stockGrams / 1000).toFixed(2)}kg`,
      level: f.stockGrams < f.minStockGrams ? "Crítico" : "Atenção",
    }));
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[14px] font-semibold text-white">Estoque Crítico</h3>
        <button className="text-[11px] text-white/50 hover:text-white" onClick={() => onSelectTab?.(8)}>Ver todos</button>
      </div>
      {items.length === 0 && (
        <div className="text-[12px] text-white/40 py-6 text-center">Tudo em ordem.</div>
      )}
      <ul className="space-y-2">
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.03] transition">
            <FilamentSpool type={c.type} color={colorHex(c.color)} size={32} className="shrink-0" label={c.name} />
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-medium text-white truncate flex items-center gap-1.5">
                <span>{c.type}</span>
                <span
                  className="inline-block size-2 rounded-full shrink-0 ring-1 ring-white/15"
                  style={{ background: colorHex(c.color) }}
                  aria-hidden
                />
                <span className="text-white/70 truncate">{c.color}</span>
              </div>
              <div className="text-[10px] text-white/40 tabular-nums">{c.qty}</div>
            </div>
            <span className={`text-[10px] font-semibold ${c.level === "Crítico" ? "text-rose-400" : "text-amber-300"}`}>{c.level}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ---------- Filament quotes (SerpAPI cached) ---------- */
function useSerpQuotes() {
  const [groups, setGroups] = useState<any[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string>("");
  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem("bambuzau_cached_quotes");
        setGroups(raw ? JSON.parse(raw) : []);
        setUpdatedAt(localStorage.getItem("bambuzau_last_quotes_update") || "");
      } catch { setGroups([]); }
    };
    load();
    const onUpd = () => load();
    window.addEventListener("bambuzau_quotes_updated", onUpd);
    return () => window.removeEventListener("bambuzau_quotes_updated", onUpd);
  }, []);
  return { groups, updatedAt };
}
function FilamentQuotes() {
  const { groups, updatedAt } = useSerpQuotes();
  const rows = (groups || []).slice(0, 6).map((g: any) => {
    const offers = Array.isArray(g.offers) ? g.offers : [];
    const prices = offers.map((o: any) => Number(o.price) || 0).filter((n: number) => n > 0);
    const avg = prices.length ? prices.reduce((a: number, b: number) => a + b, 0) / prices.length : 0;
    const min = prices.length ? Math.min(...prices) : 0;
    return { name: g.type || "—", price: avg, min, count: offers.length };
  });
  return (
    <Card>
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-[14px] font-semibold text-white">Cotação de Filamentos</h3>
        <span className="text-[10px] text-white/40">SerpAPI</span>
      </div>
      <p className="text-[11px] text-white/45 mb-4">{updatedAt ? `Atualizado em ${updatedAt}` : "Aguardando primeira sincronização…"}</p>
      {rows.length === 0 && (
        <div className="text-[12px] text-white/40 py-6 text-center">Sem cotações ainda.</div>
      )}
      <ul className="space-y-2.5">
        {rows.map((q, i) => (
          <li key={i} className="flex items-center gap-3 text-[12.5px]">
            <FilamentSpool type={q.name} color={materialColor(q.name)} size={28} className="shrink-0" label={q.name} />
            <div className="flex-1 font-semibold text-white">{q.name}</div>
            <div className="text-white/70 tabular-nums">
              {q.price ? `R$ ${q.price.toFixed(2)}` : "—"}{" "}
              <span className="text-white/35 text-[10px]">méd.</span>
            </div>
            <div className="text-[11px] font-semibold tabular-nums w-16 text-right text-white/55">
              {q.min ? `min R$ ${q.min.toFixed(0)}` : `${q.count} of.`}
            </div>
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

/* ---------- Top selling products ---------- */
function TopProductsChart({
  data = [],
  onSelectTab,
}: {
  data?: Array<{ name: string; sales: number; trend: number; image?: string }>;
  onSelectTab?: (t: number) => void;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-white">Produtos Mais Vendidos</h3>
        <button className="text-[11px] text-white/50 hover:text-white" onClick={() => onSelectTab?.(4)}>Ver todos</button>
      </div>
      {data.length === 0 && <div className="text-[12px] text-white/40 py-6 text-center">Sem vendas neste mês.</div>}
      <ul className="divide-y divide-white/[0.04]">
        {data.map((d, i) => {
          const up = d.trend >= 0;
          const trendColor = up ? LIME : "#fb7185";
          return (
            <li key={i} className="flex items-center gap-3 py-2.5">
              <div className="size-12 rounded-xl overflow-hidden bg-white/[0.04] border border-white/[0.06] shrink-0 grid place-items-center">
                {d.image ? (
                  <img src={d.image} alt={d.name} className="w-full h-full object-cover" />
                ) : (
                  <Package2 className="size-5 text-white/40" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-white truncate">{d.name}</div>
                <div className="text-[11px] text-white/45 tabular-nums">{d.sales} {d.sales === 1 ? "venda" : "vendas"}</div>
              </div>
              <div className="flex items-center gap-1 text-[12px] font-semibold tabular-nums shrink-0" style={{ color: trendColor }}>
                {up ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
                {up ? "+" : ""}{d.trend}%
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

/* ---------- Area chart: prints per hour ---------- */
function HourlyChart({ data }: { data?: Array<{ h: string; v: number }> }) {
  const fallback = useMemo(
    () => ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((h) => ({ h, v: 0 })),
    [],
  );
  const chartData = data && data.length ? data : fallback;
  return (
    <Card>
      <h3 className="text-[14px] font-semibold text-white">Faturamento por Dia da Semana</h3>
      <p className="text-[11px] text-white/45 mb-3">Receita acumulada por dia da semana no mês</p>
      <div className="h-[180px] -mx-2">
        <ResponsiveContainer>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={LIME} stopOpacity={0.45} />
                <stop offset="100%" stopColor={LIME} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="h" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: "#0f1311", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 11 }}
              labelStyle={{ color: "#fff" }}
              formatter={(v: any) => [fmtBRL(Number(v) || 0), "Faturamento"]}
            />
            <Area type="monotone" dataKey="v" stroke={LIME} strokeWidth={2} fill="url(#g1)" dot={{ r: 3, fill: LIME, stroke: "#0a0d0c", strokeWidth: 1 }}>
              <LabelList
                dataKey="v"
                position="top"
                formatter={(v: any) => {
                  const n = Number(v) || 0;
                  if (n === 0) return "";
                  if (n >= 1000) return `R$ ${(n / 1000).toFixed(1)}k`;
                  return `R$ ${n.toFixed(0)}`;
                }}
                fill="#fff"
                fontSize={10}
              />
            </Area>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

/* ---------- Financial summary ---------- */
function FinanceSummary({
  revenue = 0,
  expense = 0,
  profit = 0,
  margin = 0,
  onSelectTab,
}: { revenue?: number; expense?: number; profit?: number; margin?: number; onSelectTab?: (t: number) => void }) {
  const m = Math.max(0, Math.min(100, Math.round(margin)));
  const data = [{ v: m }, { v: 100 - m }];
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-white">Resumo Financeiro</h3>
        <button className="text-[11px] text-white/50 hover:text-white" onClick={() => onSelectTab?.(5)}>Ver todos</button>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
        <ul className="space-y-3">
          {[
            { ic: Receipt, l: "Faturamento (mês)", v: fmtBRL(revenue), c: "text-emerald-400" },
            { ic: TrendingDown, l: "Gastos (mês)",     v: fmtBRL(expense),  c: "text-rose-400" },
            { ic: TrendingUp,   l: "Lucro líquido (mês)", v: fmtBRL(profit), c: profit >= 0 ? "text-emerald-400" : "text-rose-400" },
          ].map((r, i) => {
            const Ic = r.ic;
            return (
              <li key={i} className="flex items-center gap-3 text-[12.5px]">
                <div className="size-8 rounded bg-white/[0.04] grid place-items-center"><Ic className="size-4 text-white/60" /></div>
                <div className="flex-1 text-white/70">{r.l}</div>
                <div className={`text-white font-semibold tabular-nums ${r.c}`}>{r.v}</div>
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
              <div className="text-[20px] font-bold tabular-nums" style={{ color: LIME }}>{m}%</div>
              <div className="text-[9px] text-white/45">Margem de<br/>lucro</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ---------- PANEL (embeddable in legacy app) ---------- */
const fmtBRL = (v: number) =>
  `R$ ${(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface Print3DPanelProps {
  orders?: any[];
  printers?: any[];
  filamentStocks?: any[];
  expenses?: any[];
  clients?: any[];
  shoppingItems?: any[];
  onSelectTab?: (tab: number) => void;
}

export function Print3DPanel({
  orders = [],
  printers = [],
  filamentStocks = [],
  expenses = [],
  clients = [],
  onSelectTab,
}: Print3DPanelProps = {}) {
  // === Real KPIs (today) ===
  const today = new Date();
  const isToday = (d: any) => {
    if (!d) return false;
    const dt = new Date(d);
    return (
      dt.getFullYear() === today.getFullYear() &&
      dt.getMonth() === today.getMonth() &&
      dt.getDate() === today.getDate()
    );
  };
  const ordersToday = orders.filter((o: any) => isToday(o.createdAt || o.deliveryDate));
  const revenueToday = ordersToday.reduce((s: number, o: any) => s + (o.priceCharged || 0), 0);
  const piecesToday = ordersToday.reduce((s: number, o: any) => s + (o.quantity || 1), 0);
  const hoursToday = ordersToday.reduce((s: number, o: any) => s + (o.printingTimeHours || 0), 0);
  const hoursLabel = `${Math.floor(hoursToday)}h ${Math.round((hoursToday % 1) * 60)}m`;
  const expensesToday = expenses
    .filter((e: any) => isToday(e.date || e.createdAt))
    .reduce((s: number, e: any) => s + (e.amount || e.value || 0), 0);
  const activePrinters = printers.filter((p: any) => p.status === "PRINTING").length;
  const printersTotal = printers.length;

  // === Month aggregates for finance summary ===
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
  const monthOrders = orders.filter((o: any) => (o.createdAt || 0) >= monthStart && o.status !== "WAITING");
  const monthRevenue = monthOrders.reduce((s: number, o: any) => s + (o.priceCharged || 0), 0);
  const monthExpenses = expenses
    .filter((e: any) => (e.date || 0) >= monthStart)
    .reduce((s: number, e: any) => s + ((e.amount || 0) * (e.qty || 1)), 0);
  const monthProfit = monthRevenue - monthExpenses;
  const monthMargin = monthRevenue > 0 ? (monthProfit / monthRevenue) * 100 : 0;

  // Top products by revenue in month (with catalog image lookup)
  let catalog: any[] = [];
  try {
    catalog = JSON.parse(
      (typeof localStorage !== "undefined" &&
        localStorage.getItem("bambuzau_local_catalog_production")) || "[]",
    );
  } catch {
    catalog = [];
  }
  const imageByName: Record<string, string | undefined> = {};
  catalog.forEach((c: any) => {
    if (c?.name) imageByName[String(c.name).toUpperCase().trim()] = c.imageUrl;
  });
  const prodMap: Record<string, number> = {};
  monthOrders.forEach((o: any) => {
    const k = o.itemName || "Peça Personalizada";
    prodMap[k] = (prodMap[k] || 0) + (o.priceCharged || 0);
  });
  const prodTotal = Object.values(prodMap).reduce((a, b) => a + b, 0) || 1;
  const topProducts = Object.entries(prodMap)
    .map(([name, revenue]) => ({
      name,
      revenue,
      v: Math.round((revenue / prodTotal) * 100),
      image: imageByName[name.toUpperCase().trim()],
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Revenue per weekday in current month
  const weekdayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const hourly = weekdayLabels.map((h) => ({ h, v: 0 }));
  monthOrders.forEach((o: any) => {
    const ts = o.createdAt || o.deliveryDate;
    if (!ts) return;
    const dow = new Date(ts).getDay();
    hourly[dow].v += o.priceCharged || 0;
  });

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
                <Calendar className="size-3.5" />{" "}
                {today.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}{" "}
                <ChevronDown className="size-3" />
              </button>
              <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[12px] text-white/75 hover:bg-white/[0.06]">
                <Filter className="size-3.5" /> Filtros <ChevronDown className="size-3" />
              </button>
              <button
                onClick={() => onSelectTab?.(3)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12px] font-bold text-black hover:brightness-110 transition"
                style={{ background: LIME, boxShadow: `0 6px 18px -6px ${LIME}aa` }}
              >
                <Plus className="size-3.5" strokeWidth={2.8} /> Novo Pedido
              </button>
            </div>
          </div>

          {/* KPIs (Row 1 — exatamente como o layout) */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            <Kpi label="Pedidos Hoje"        value={String(ordersToday.length)}              delta={`${activePrinters}/${printersTotal}`} Icon={ShoppingBag} />
            <Kpi label="Faturamento Hoje"    value={fmtBRL(revenueToday)}                    delta="hoje" Icon={DollarSign} />
            <Kpi label="Peças Impressas"     value={String(piecesToday)}                     delta="hoje" Icon={Package2} />
            <Kpi label="Horas de Impressão"  value={hoursLabel}                              delta="hoje" Icon={Clock} />
            <Kpi label="Gastos Hoje"         value={fmtBRL(expensesToday)}                   delta="hoje" Icon={Wallet} />
          </div>

          {/* Row 2: Mapa | Impressão ao Vivo | Pedidos | Higrômetros */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card>
              <h3 className="text-[14px] font-semibold text-white">Mapa de Clientes</h3>
              <p className="text-[11px] text-white/45 mb-2">{clients.length} clientes cadastrados</p>
              <ClientsMap clients={clients} />
            </Card>
            <LivePrinters printers={printers} orders={orders} />
            <OrdersList orders={orders} clients={clients} onSelectTab={onSelectTab} />
            <Sensors filaments={filamentStocks} />
          </div>

          {/* Row 3: STL | Estoque Crítico | Cotação | IA Precificação */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="md:col-span-2 xl:col-span-1"><StlGallery orders={orders} /></div>
            <CriticalStock filaments={filamentStocks} onSelectTab={onSelectTab} />
            <FilamentQuotes />
            <AiPricing />
          </div>

          {/* Row 4: Categorias | Hora | Resumo Financeiro */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <TopProductsChart data={topProducts} />
            <HourlyChart data={hourly} />
            <FinanceSummary revenue={monthRevenue} expense={monthExpenses} profit={monthProfit} margin={monthMargin} onSelectTab={onSelectTab} />
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