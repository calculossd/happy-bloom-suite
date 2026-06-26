import { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
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
import dashboardHero from "@/assets/dashboard-hero.jpg.asset.json";
import { Kpi as PremiumKpi } from "@/legacy-app/components/DashboardShell";

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
            <div className="text-[12.5px] font-semibold text-white">Olá, Inova Mundo!</div>
            <div className="text-[10.5px] text-white/45">Administrador</div>
          </div>
          <ChevronDown className="size-3.5 text-white/40" />
        </div>
      </div>
    </header>
  );
}

/* ---------- Card primitive (Obsidian Glass) ---------- */
function Card({ children, className = "", onClick, glow }: { children: React.ReactNode; className?: string; onClick?: () => void; glow?: string }) {
  const tone = glow || LIME;
  return (
    <div className={`group relative p-[1px] rounded-2xl bg-white/10 transition-all duration-500 hover:scale-[1.005] ${className}`} onClick={onClick}>
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-3 rounded-2xl blur-2xl opacity-50 group-hover:opacity-90 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at center, ${tone}33, transparent 70%)` }}
      />
      <div
        className="relative overflow-hidden rounded-[15px] p-5 backdrop-blur-xl border border-white/10 h-full"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.012) 100%), #0a0d0c",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.05), 0 30px 60px -30px rgba(0,0,0,0.85)",
        }}
      >
        <span aria-hidden className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: tone }} />
        <div className="relative h-full">{children}</div>
      </div>
    </div>
  );
}

/* ---------- Scrollable list with chevron hint ---------- */
function ScrollHint({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasMore, setHasMore] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const check = () => setHasMore(el.scrollHeight - el.clientHeight - el.scrollTop > 4);
    check();
    el.addEventListener("scroll", check, { passive: true });
    const ro = new ResizeObserver(check); ro.observe(el);
    return () => { el.removeEventListener("scroll", check); ro.disconnect(); };
  }, []);
  return (
    <div className={`relative flex-1 min-h-0 ${className}`}>
      <div ref={ref} className="h-full overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
        {children}
      </div>
      {hasMore && (
        <button
          type="button"
          onClick={() => ref.current?.scrollBy({ top: 120, behavior: "smooth" })}
          className="absolute bottom-1 left-1/2 -translate-x-1/2 size-6 grid place-items-center rounded-full bg-white/[0.08] border border-white/15 text-white/75 hover:text-white hover:bg-white/[0.14] backdrop-blur transition"
          aria-label="Mostrar mais"
        >
          <ChevronDown className="size-3.5" />
        </button>
      )}
    </div>
  );
}

/* ---------- KPI ---------- */
const KPI_TONES = [
  { c: "#a3e635", name: "lime" },
  { c: "#f0c674", name: "gold" },
  { c: "#60a5fa", name: "blue" },
  { c: "#a78bfa", name: "purple" },
  { c: "#34d399", name: "emerald" },
  { c: "#fb923c", name: "orange" },
];
function Kpi({ label, value, delta, Icon, tone = 0 }: { label: string; value: string; delta: string; Icon: any; tone?: number }) {
  const t = KPI_TONES[tone % KPI_TONES.length].c;
  return (
    <Card glow={t} className="overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-white/45 font-medium">{label}</div>
          <div className="mt-3 text-[28px] font-bold tracking-tight text-white tabular-nums" style={{ textShadow: `0 0 24px ${t}33` }}>{value}</div>
        </div>
        <div
          className="size-10 rounded-xl grid place-items-center border"
          style={{
            background: `radial-gradient(120% 120% at 0% 0%, ${t}30 0%, ${t}08 60%, transparent 100%)`,
            borderColor: `${t}33`,
            boxShadow: `0 8px 24px -10px ${t}55, inset 0 0 0 1px rgba(255,255,255,0.03)`,
          }}
        >
          <Icon className="size-[18px]" style={{ color: t }} />
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-white/[0.05] text-[11px] flex items-center gap-1.5" style={{ color: t }}>
        <TrendingUp className="size-3" />
        <span className="font-semibold">{delta}</span>
        <span className="text-white/40 font-normal">vs ontem</span>
      </div>
    </Card>
  );
}

/* ---------- Real Leaflet map with client geocoding ---------- */
const GEOCODE_CACHE_KEY = "print3d_geocode_cache_v3";
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
function normalizeText(value?: any) {
  return String(value || "").replace(/\s+/g, " ").trim();
}
function digitsOnly(value?: any) {
  return String(value || "").replace(/\D/g, "");
}
function formatCep(value?: any) {
  const cep = digitsOnly(value);
  return cep.length === 8 ? `${cep.slice(0, 5)}-${cep.slice(5)}` : normalizeText(value);
}
function stripAccents(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function isBrazilPoint(p: { lat: number; lng: number } | null) {
  return !!p && p.lat >= -34.5 && p.lat <= 6.5 && p.lng >= -74.5 && p.lng <= -32;
}
function getClientCityState(c: any) {
  const address = normalizeText(c?.address);
  let city = normalizeText(c?.city);
  let state = normalizeText(c?.state).toUpperCase();
  if ((!city || !state) && address) {
    const match = address.match(/(?:,\s*)?([^,]+?)\s*[-/]\s*([A-Z]{2})(?:\s*,?\s*Brasil)?\s*$/i);
    if (match) {
      if (!city) city = normalizeText(match[1]);
      if (!state) state = normalizeText(match[2]).toUpperCase();
    }
  }
  return { city, state };
}
function cleanStreetAddress(address: string, city: string, state: string, cep: string) {
  let street = normalizeText(address)
    .replace(/\bBrasil\b/gi, "")
    .replace(/\bCEP\b/gi, "")
    .replace(/\d{5}-?\d{3}/g, "")
    .replace(/\s*,\s*$/g, "")
    .trim();
  if (city && state) {
    street = street.replace(new RegExp(`,?\\s*${escapeRegExp(city)}\\s*[-/]\\s*${escapeRegExp(state)}\\s*$`, "i"), "").trim();
  }
  if (state) {
    street = street.replace(new RegExp(`,?\\s*${escapeRegExp(state)}\\s*$`, "i"), "").trim();
  }
  if (cep) {
    street = street.replace(new RegExp(escapeRegExp(cep), "gi"), "").trim();
  }
  return street.replace(/\s*,\s*,/g, ",").replace(/\s+,/g, ",").replace(/,\s*$/g, "");
}
function buildClientGeocodeQueries(c: any) {
  const address = normalizeText(c?.address);
  const cep = formatCep(c?.cep);
  const { city, state } = getClientCityState(c);
  const cityState = city && state ? `${city} - ${state}` : [city, state].filter(Boolean).join(", ");
  const street = cleanStreetAddress(address, city, state, cep);

  const candidates = [
    [street, cityState, cep, "Brasil"].filter(Boolean).join(", "),
    [street, cityState, "Brasil"].filter(Boolean).join(", "),
    [street, cep, "Brasil"].filter(Boolean).join(", "),
    [address, cityState, cep, "Brasil"].filter(Boolean).join(", "),
    [cep, cityState, "Brasil"].filter(Boolean).join(", "),
  ];

  return Array.from(new Set(candidates.map(normalizeText).filter((q) => q.length > 4)));
}
async function geocodeByCep(cepValue?: any): Promise<{ lat: number; lng: number } | null> {
  const cep = digitsOnly(cepValue);
  if (cep.length !== 8) return null;
  try {
    const r = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`, { headers: { Accept: "application/json" } });
    if (!r.ok) return null;
    const j = await r.json();
    const coords = j?.location?.coordinates;
    const lat = Number(coords?.latitude);
    const lng = Number(coords?.longitude);
    const point = Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
    return isBrazilPoint(point) ? point : null;
  } catch {}
  try {
    const r = await fetch(`https://cep.awesomeapi.com.br/json/${cep}`, { headers: { Accept: "application/json" } });
    if (!r.ok) return null;
    const j = await r.json();
    const lat = Number(j?.lat);
    const lng = Number(j?.lng);
    const point = Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
    return isBrazilPoint(point) ? point : null;
  } catch {}
  return null;
}
async function geocodeOne(q: string): Promise<{ lat: number; lng: number } | null> {
  const specificQuery = /\d{5}-?\d{3}/.test(q) || /,\s*\d+\b/.test(q) || /\b(rua|avenida|av\.?|travessa|estrada|rodovia|alameda|praça|praca)\b/i.test(q);
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&addressdetails=1&countrycodes=br&accept-language=pt-BR&q=${encodeURIComponent(q)}`;
  try {
    const r = await fetch(url, { headers: { Accept: "application/json" } });
    const j = await r.json();
    if (!Array.isArray(j)) return null;
    const scored = j
      .map((item: any) => {
        const point = { lat: parseFloat(item.lat), lng: parseFloat(item.lon) };
        if (!isBrazilPoint(point)) return null;
        const display = stripAccents(`${item.display_name || ""} ${JSON.stringify(item.address || {})}`);
        const query = stripAccents(q);
        const administrativeTypes = ["city", "town", "village", "municipality", "administrative", "state"];
        let score = Number(item.importance || 0);
        if (/\d{5}-?\d{3}/.test(q) && display.includes(digitsOnly(q).slice(0, 5))) score += 4;
        if (/\b(rua|avenida|av\.?|travessa|estrada|rodovia|alameda|praça|praca)\b/i.test(q) && /(road|residential|house_number|postcode|suburb)/.test(display)) score += 3;
        if (/\b[A-Z]{2}\b/.test(q) && query.split(/\s+/).some((part) => part.length === 2 && display.includes(part))) score += 1;
        if (specificQuery && administrativeTypes.includes(String(item.type || "").toLowerCase())) score -= 8;
        return { point, score };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.score - a.score);
    const best = scored[0] as any;
    if (best && (!specificQuery || best.score > -2)) return best.point;
  } catch {}
  return null;
}

function ClientsMap({ clients = [] }: { clients?: any[] }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [interactive, setInteractive] = useState(false);

  // Init Leaflet once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !ref.current || mapRef.current) return;
      const map = L.map(ref.current, {
        center: [-14.235, -51.9253],
        zoom: 4,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        boxZoom: false,
        keyboard: false,
      });
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png",
        { maxZoom: 19, subdomains: "abcd" },
      ).addTo(map);
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png",
        { maxZoom: 19, subdomains: "abcd", pane: "shadowPane" },
      ).addTo(map);
      mapRef.current = map;
      layerRef.current = L.layerGroup().addTo(map);
      setReady(true);
    })();
    return () => {
      cancelled = true;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, []);

  // Toggle interaction (zoom/drag) on demand
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const fns = ["dragging", "scrollWheelZoom", "doubleClickZoom", "touchZoom", "boxZoom", "keyboard"] as const;
    fns.forEach((f) => {
      const handler = (map as any)[f];
      if (handler && typeof handler.enable === "function") {
        interactive ? handler.enable() : handler.disable();
      }
    });
    setTimeout(() => map.invalidateSize(), 30);
  }, [interactive, ready]);

  // Geocode + render markers
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      const cache = loadGeocodeCache();
      const points: Array<{ lat: number; lng: number; name: string }> = [];
      const clientsToMap = clients.filter((c: any) => c?.address || c?.cep);
      // Geocode missing ones sequentially (public geocoders have low rate limits)
      for (const c of clientsToMap) {
        if (cancelled) return;
        const queries = buildClientGeocodeQueries(c);
        let point: { lat: number; lng: number } | null = null;
        if (digitsOnly(c?.cep).length === 8) {
          const cepKey = `cep:${digitsOnly(c.cep)}`;
          if (!(cepKey in cache)) {
            cache[cepKey] = await geocodeByCep(c.cep);
            saveGeocodeCache(cache);
          }
          point = cache[cepKey];
        }
        for (const q of queries) {
          if (point) break;
          const key = `nom:${q}`;
          if (!(key in cache)) {
            cache[key] = await geocodeOne(q);
            saveGeocodeCache(cache);
            await new Promise((r) => setTimeout(r, 1100));
          }
          if (cache[key]) {
            point = cache[key];
            break;
          }
        }
        if (point) {
          points.push({ ...point, name: c.name || "Cliente" });
        }
      }
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
      if (points.length === 1) {
        mapRef.current.setView([points[0].lat, points[0].lng], 14);
      } else if (points.length > 1) {
        const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
        mapRef.current.fitBounds(bounds.pad(0.25), { maxZoom: 13 });
      }
      setTimeout(() => mapRef.current?.invalidateSize(), 50);
    })();
    return () => { cancelled = true; };
  }, [ready, clients]);

  return (
    <div className="relative h-full w-full min-h-[420px]">
      <div
        ref={ref}
        className="relative z-10 h-full w-full min-h-[420px] overflow-hidden"
        style={{ filter: "saturate(0.55) brightness(0.82) contrast(0.92) hue-rotate(-10deg)" }}
      />
      <button
        type="button"
        onClick={() => setInteractive((v) => !v)}
        className={`absolute top-3 right-3 z-[400] px-3 py-1.5 rounded-lg text-[11px] font-semibold border backdrop-blur-sm transition ${
          interactive
            ? "bg-[var(--brand-lime,#c6ff3a)] text-black border-transparent shadow-lg"
            : "bg-black/60 text-white border-white/15 hover:bg-black/80"
        }`}
      >
        {interactive ? "🔓 Mapa Liberado" : "🔒 Habilitar Zoom"}
      </button>
    </div>
  );
}

/* ---------- Live printers ---------- */
const STATUS_LABEL: Record<string, string> = {
  PRINTING: "Imprimindo",
  IDLE: "Ociosa",
  MAINTENANCE: "Manutenção",
};
const getPrinterLogo = (model: string = "", customUrl?: string) => {
  if (customUrl && customUrl.trim()) return customUrl.trim();
  const m = model.toLowerCase();
  if (m.includes("bambu") || m.includes("p1") || m.includes("x1") || m.includes("a1"))
    return "https://images.unsplash.com/photo-1701073837941-f76a5bf98505?auto=format&fit=crop&w=200&q=80";
  if (m.includes("kobra") || m.includes("anycubic"))
    return "https://images.unsplash.com/photo-1631544114022-fe3a917a4dde?auto=format&fit=crop&w=200&q=80";
  if (m.includes("k1") || m.includes("creality") || m.includes("ender") || m.includes("v3") || m.includes("sermoon"))
    return "https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=200&q=80";
  if (m.includes("prusa") || m.includes("mk3") || m.includes("mk4") || m.includes("mini"))
    return "https://images.unsplash.com/photo-1544993130-9df2492f2549?auto=format&fit=crop&w=200&q=80";
  if (m.includes("resina") || m.includes("resin") || m.includes("sla") || m.includes("elegoo") || m.includes("photon") || m.includes("halot"))
    return "https://images.unsplash.com/photo-1614853316476-de00d14cb1fc?auto=format&fit=crop&w=200&q=80";
  if (m.includes("artillery") || m.includes("genius") || m.includes("sidewinder"))
    return "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=200&q=80";
  return "https://images.unsplash.com/photo-1563206767-5b18f218e8de?auto=format&fit=crop&w=200&q=80";
};
function LivePrinters({ printers = [], orders = [], onSelectTab }: { printers?: any[]; orders?: any[]; onSelectTab?: (t: number) => void }) {
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
    return { name: p.name || p.model, model: p.model || "", customUrl: p.customUrl, material, remaining, pct: Math.max(0, Math.min(100, pct)), isPrinting: p.status === "PRINTING" };
  });
  return (
    <Card glow="#38bdf8" className="flex flex-col overflow-hidden">
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
      <ScrollHint>
      <ul className="space-y-3">
        {rows.map((p, i) => (
          <li
            key={i}
            role="button"
            tabIndex={0}
            onClick={() => onSelectTab?.(16)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelectTab?.(16); } }}
            className="flex items-center gap-3 group cursor-pointer rounded-lg -mx-1 px-1 py-1 hover:bg-white/[0.03] transition"
          >
            <div
              className={`size-10 rounded-lg overflow-hidden bg-white/[0.03] shrink-0 relative border-2 ${p.isPrinting ? 'border-emerald-400' : 'border-red-500'}`}
              style={{ boxShadow: p.isPrinting ? '0 0 10px rgba(16,185,129,0.55)' : '0 0 10px rgba(239,68,68,0.5)' }}
            >
              <img
                src={getPrinterLogo(p.model, p.customUrl)}
                alt={p.name}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
              <PrinterIcon className="size-5 text-white/70 absolute inset-0 m-auto" />
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
      </ScrollHint>
    </Card>
  );
}

function StatusPill({ s }: { s: string }) {
  const map: Record<string, string> = {
    "Ag. Arquivo": "bg-amber-400/10 text-amber-300 border-amber-400/20",
    "Aguardando Aceite": "bg-white/[0.05] text-white/65 border-white/10",
    "Imprimindo": "bg-violet-400/10 text-violet-300 border-violet-400/20",
    "Acabamento": "bg-sky-400/10 text-sky-300 border-sky-400/20",
    "Pronto para Entrega": "bg-fuchsia-400/10 text-fuchsia-300 border-fuchsia-400/20",
    "Pronto": "bg-blue-400/10 text-blue-300 border-blue-400/20",
    "Entregue": "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
  };
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${map[s] || ""}`}>{s}</span>;
}
const ORDER_STATUS_LABEL: Record<string, string> = {
  WAITING: "Ag. Arquivo",
  QUEUE: "Aguardando Aceite",
  PRINTING: "Imprimindo",
  POST_PROCESS: "Acabamento",
  PACKING: "Pronto para Entrega",
  READY: "Pronto",
  DELIVERED: "Entregue",
};
function OrdersList({ orders = [], clients = [], onSelectTab }: { orders?: any[]; clients?: any[]; onSelectTab?: (t: number) => void }) {
  const rows = orders
    .filter((o: any) => o.status !== "DELIVERED")
    .slice()
    .sort((a: any, b: any) => (a.deadline || 0) - (b.deadline || 0))
    .slice(0, 14);
  const cityById: Record<number, string> = {};
  clients.forEach((c: any) => (cityById[c.id] = (c.address || "").split(",").pop()?.trim() || ""));
  return (
    <Card glow="#f0c674" className="flex flex-col overflow-hidden cursor-pointer transition" onClick={() => onSelectTab?.(1)}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[14px] font-semibold text-white">Pedidos a Serem Entregues</h3>
        <button className="text-[11px] text-white/50 hover:text-white" onClick={(e) => { e.stopPropagation(); onSelectTab?.(1); }}>Ver todos</button>
      </div>
      {rows.length === 0 && (
        <div className="text-[12px] text-white/40 py-6 text-center">Sem pedidos pendentes.</div>
      )}
      <ScrollHint>
      <ul className="divide-y divide-white/[0.04]">
        {rows.map((o: any) => {
          const isPrinting = o.status === "PRINTING";
          const pct = isPrinting ? Math.max(2, Math.round((o.printingProgress || 0) * 100)) : 0;
          return (
            <li key={o.id} className="flex items-center gap-2 py-1.5 text-[11.5px]">
              <span className="font-mono text-white/40 text-[10px] w-7 shrink-0">#{o.id}</span>
              <div className="min-w-0 flex-1 flex items-center gap-1.5">
                <span className="text-white font-medium truncate">{o.itemName || "—"}</span>
                {o.clientName && (
                  <span className="text-white/40 truncate hidden sm:inline">· {o.clientName}</span>
                )}
              </div>
              {isPrinting && (
                <div className="flex items-center gap-1.5 shrink-0 w-[90px]">
                  <div className="flex-1 h-1 rounded-full bg-white/[0.05] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#b7ff00] transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono font-bold tabular-nums text-emerald-300 w-7 text-right">{pct}%</span>
                </div>
              )}
              <span className="text-white/40 tabular-nums hidden md:inline text-[10px] shrink-0">
                {o.deadline ? new Date(o.deadline).toLocaleDateString("pt-BR") : "—"}
              </span>
              <StatusPill s={ORDER_STATUS_LABEL[o.status] || o.status} />
            </li>
          );
        })}
      </ul>
      </ScrollHint>
    </Card>
  );
}

/* ---------- Hygrometers (replaces Sensors slot) ---------- */
function Hygrometers({ devices = [], onSelectTab }: { devices?: any[]; onSelectTab?: (t: number) => void }) {
  const tone = (h: number) => {
    if (h < 30) return { color: "#38bdf8", label: "Ideal", bg: "rgba(56,189,248,0.12)", border: "rgba(56,189,248,0.32)" };
    if (h <= 45) return { color: "#fbbf24", label: "Atenção", bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.32)" };
    return { color: "#fb7185", label: "Crítico", bg: "rgba(251,113,133,0.12)", border: "rgba(251,113,133,0.32)" };
  };
  return (
    <Card glow="#38bdf8" className="cursor-pointer transition" onClick={() => onSelectTab?.(5)}>
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[14px] font-semibold text-white">Higrômetros</h3>
        <span className="text-[10px] text-white/40 tabular-nums">{devices.length}</span>
      </div>
      <p className="text-[11px] text-white/45 mb-4">Umidade das estufas</p>
      {devices.length === 0 && (
        <div className="text-[12px] text-white/40 py-6 text-center">Nenhum higrômetro configurado.</div>
      )}
      <ul className="space-y-3">
        {devices.map((dev: any) => {
          const h = Number(dev.currentHumidity ?? 0);
          const t = tone(h);
          const pct = Math.max(2, Math.min(100, h));
          return (
            <li
              key={dev.id}
              className="p-2.5 rounded-lg border"
              style={{ background: t.bg, borderColor: t.border }}
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="size-8 rounded-lg grid place-items-center shrink-0" style={{ background: `${t.color}22`, border: `1px solid ${t.color}55` }}>
                  <Droplets className="size-4" style={{ color: t.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-semibold text-white truncate">{dev.name}</div>
                  {dev.temperature != null && (
                    <div className="text-[10px] text-white/45 tabular-nums">{Number(dev.temperature).toFixed(1)}°C</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-[16px] font-bold tabular-nums leading-none" style={{ color: t.color }}>{h.toFixed(1)}%</div>
                  <div className="text-[9px] uppercase tracking-wider mt-0.5" style={{ color: t.color }}>{t.label}</div>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: t.color, boxShadow: `0 0 10px ${t.color}88` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

/* ---------- STL gallery (recent orders) ---------- */
function StlGallery({ orders = [], clients = [] }: { orders?: any[]; clients?: any[] }) {
  const stockImageByName: Record<string, string | undefined> = {};
  const stockQtyByName: Record<string, number> = {};
  const registeredNames = new Set<string>();
  // Registered = present in the local catalog (cadastro de produtos)
  try {
    const cat = JSON.parse(
      (typeof localStorage !== "undefined" &&
        localStorage.getItem("bambuzau_local_catalog_production")) || "[]",
    );
    (cat || []).forEach((c: any) => {
      const key = String(c?.name || "").toLowerCase().trim();
      if (key) registeredNames.add(key);
    });
  } catch {}
  clients.forEach((c: any) => {
    (c?.productsStock || []).forEach((p: any) => {
      const key = String(p?.name || "").toLowerCase().trim();
      if (key && p?.imageUrl && !stockImageByName[key]) stockImageByName[key] = p.imageUrl;
      if (key) stockQtyByName[key] = (stockQtyByName[key] || 0) + Number(p?.qty || 0);
    });
  });
  try {
    const cat = JSON.parse(
      (typeof localStorage !== "undefined" &&
        localStorage.getItem("bambuzau_local_catalog_production")) || "[]",
    );
    (cat || []).forEach((c: any) => {
      const key = String(c?.name || "").toLowerCase().trim();
      if (key && c?.imageUrl && !stockImageByName[key]) stockImageByName[key] = c.imageUrl;
      if (key && c?.stockCount != null && stockQtyByName[key] == null)
        stockQtyByName[key] = Number(c.stockCount) || 0;
    });
  } catch {}
  const orderItems = orders
    .filter((o: any) => registeredNames.has(String(o?.itemName || "").toLowerCase().trim()))
    .map((o: any) => {
    const key = String(o?.itemName || "").toLowerCase().trim();
    const qty = stockQtyByName[key];
    return {
      name: o.itemName,
      ts: o.createdAt || 0,
      date: o.createdAt ? new Date(o.createdAt).toLocaleDateString("pt-BR") : "",
      mat: `${o.filamentType ?? ""}${o.filamentColor ? ` — ${o.filamentColor}` : ""}`,
      stockQty: qty,
      imageUrl: o.imageUrl || stockImageByName[key],
      source: "Pedido",
    };
  });
  const stockItems: any[] = [];
  clients.forEach((c: any) => {
    (c?.productsStock || []).forEach((p: any) => {
      const key = String(p?.name || "").toLowerCase().trim();
      if (!registeredNames.has(key)) return;
      stockItems.push({
        name: p.name,
        ts: p.addedAt || p.createdAt || 0,
        date: "",
        mat: `Estoque · ${p.qty ?? 0}un`,
        imageUrl: p.imageUrl,
        source: "Estoque",
      });
    });
  });
  try {
    const cat = JSON.parse(
      (typeof localStorage !== "undefined" &&
        localStorage.getItem("bambuzau_local_catalog_production")) || "[]",
    );
    (cat || []).forEach((c: any) => {
      if (!c?.name) return;
      const qty = Number(c.stockCount ?? 0);
      stockItems.push({
        name: c.name,
        ts: c.updatedAt || c.createdAt || 0,
        date: "",
        mat: `Estoque · ${qty}un`,
        imageUrl: c.imageUrl,
        source: "Estoque",
      });
    });
  } catch {}
  const items = [...orderItems, ...stockItems]
    .sort((a, b) => (b.ts || 0) - (a.ts || 0))
    .slice(0, 10);
  return (
    <Card glow="#f0c674">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-white">Últimas Peças Impressas</h3>
        <button className="text-[11px] text-white/50 hover:text-white">Ver todos</button>
      </div>
      {items.length === 0 && (
        <div className="text-[12px] text-white/40 py-6 text-center">Sem peças recentes.</div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((s, i) => (
          <div key={i} className="group cursor-pointer">
            <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-white/[0.05] to-white/[0.01] border border-white/[0.05] grid place-items-center mb-2 group-hover:border-white/15 transition relative overflow-hidden">
              {s.imageUrl ? (
                <img src={s.imageUrl} alt={s.name} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <Box className="size-16 text-white/30 group-hover:scale-110 transition" />
              )}
              {s.source !== "Estoque" && (
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9.5px] font-semibold uppercase tracking-wider" style={{ background: "rgba(0,0,0,0.55)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" }}>{s.source}</div>
              )}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition" style={{ background: `radial-gradient(circle at center, ${LIME}15, transparent 70%)` }} />
            </div>
            <div className="text-[11.5px] font-medium text-white truncate">{s.name}</div>
            <div className="text-[10px] text-white/40 tabular-nums">{s.date}</div>
            <div className="text-[10px] text-white/40">{s.mat}</div>
            {s.source === "Pedido" && s.stockQty != null && (
              <div className="text-[10px] font-semibold" style={{ color: LIME }}>
                Estoque · {s.stockQty}un
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ---------- Stock overview (Saúde + Crítico combinados) ---------- */
function StockOverview({ filaments = [], onSelectTab }: { filaments?: any[]; onSelectTab?: (t: number) => void }) {
  const items = filaments
    .filter((f: any) => f.stockGrams < f.minStockGrams * 1.5)
    .slice()
    .sort((a: any, b: any) => a.stockGrams / Math.max(1, a.minStockGrams) - b.stockGrams / Math.max(1, b.minStockGrams))
    .slice(0, 5)
    .map((f: any) => ({
      name: `${f.type} ${f.color}`,
      type: f.type,
      color: f.color,
      qty: `${(f.stockGrams / 1000).toFixed(2)}kg`,
      level: f.stockGrams < f.minStockGrams ? "Crítico" : "Atenção",
    }));
  return (
    <Card glow="#fb7185" className="relative overflow-hidden flex flex-col cursor-pointer transition" onClick={() => onSelectTab?.(4)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[14px] font-semibold text-white">Estoque Crítico</h3>
        <button className="text-[11px] text-white/50 hover:text-white" onClick={(e) => { e.stopPropagation(); onSelectTab?.(4); }}>Ver todos</button>
      </div>

      {items.length === 0 ? (
        <div className="text-[12px] text-white/40 py-3 text-center">Tudo em ordem.</div>
      ) : (
        <ScrollHint>
        <ul className="space-y-2">
          {items.map((c, i) => (
            <li key={i} className={`flex items-center gap-3 p-2 rounded-lg border hover:bg-white/[0.03] transition ${c.level === "Crítico" ? "border-rose-500/60 bg-rose-500/[0.04]" : "border-white/10"}`}>
              <FilamentSpool type={c.type} color={colorHex(c.color)} size={28} className="shrink-0" label={c.name} />
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-medium text-white truncate flex items-center gap-1.5">
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
        </ScrollHint>
      )}
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
function FilamentQuotes({ onSelectTab }: { onSelectTab?: (t: number) => void } = {}) {
  const { groups, updatedAt } = useSerpQuotes();
  const rows = (groups || []).slice(0, 6).map((g: any) => {
    const offers = Array.isArray(g.offers) ? g.offers : [];
    const prices = offers.map((o: any) => Number(o.price) || 0).filter((n: number) => n > 0);
    const avg = prices.length ? prices.reduce((a: number, b: number) => a + b, 0) / prices.length : 0;
    const min = prices.length ? Math.min(...prices) : 0;
    return { name: g.type || "—", price: avg, min, count: offers.length };
  });
  return (
    <Card glow="#047857" className="cursor-pointer transition" onClick={() => onSelectTab?.(7)}>
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
function AiPricing({ orders = [], onSelectTab }: { orders?: any[]; onSelectTab?: (t: number) => void }) {
  // Real data from delivered/sold orders
  const sample = orders.filter((o: any) => (o?.priceCharged || 0) > 0);
  const getCost = (o: any) =>
    Number(o?.cost ?? o?.totalCost ?? o?.productionCost ?? o?.filamentCost ?? 0);
  const totalPrice = sample.reduce((s, o) => s + Number(o.priceCharged || 0), 0);
  const totalCost = sample.reduce((s, o) => s + getCost(o), 0);
  const n = sample.length;
  const avgCost = n ? totalCost / n : 0;
  const avgPrice = n ? totalPrice / n : 0;
  const margin = avgPrice > 0 ? Math.max(0, Math.min(100, ((avgPrice - avgCost) / avgPrice) * 100)) : 0;
  const marginRounded = Math.round(margin);
  const suggested = avgCost > 0 ? avgCost / 0.35 : avgPrice; // alvo de 65% de margem
  const fmt = (v: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const data = [{ name: "m", value: marginRounded }, { name: "r", value: 100 - marginRounded }];
  const openCalc = () => {
    try { localStorage.setItem("bambuzau_costs_subtab_override", "CALC"); } catch {}
    window.dispatchEvent(new CustomEvent("navigate-costs-subtab", { detail: "CALC" }));
    window.dispatchEvent(new CustomEvent("costs_set_subtab", { detail: "CALC" }));
  };
  return (
    <Card
      glow="#a78bfa"
      className="cursor-pointer transition hover:border-white/[0.12]"
      onClick={openCalc}
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[14px] font-semibold text-white">IA de Precificação</h3>
        <button
          className="text-[11px] text-white/50 hover:text-white"
          onClick={(e) => { e.stopPropagation(); openCalc(); }}
        >
          Abrir
        </button>
      </div>
      <p className="text-[11px] text-white/45 mb-4">
        {n > 0 ? `Média de ${n} ${n === 1 ? "pedido" : "pedidos"} com preço` : "Sem pedidos com preço ainda"}
      </p>
      <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-4">
        <div>
          <div className="text-[10px] text-white/45">Custo atual</div>
          <div className="text-[18px] font-bold text-white tabular-nums">R$ {fmt(avgCost)}</div>
        </div>
        <div>
          <div className="text-[10px] text-white/45">Preço sugerido</div>
          <div className="text-[18px] font-bold tabular-nums" style={{ color: LIME }}>R$ {fmt(suggested)}</div>
        </div>
        <div className="relative size-[78px]">
          <ResponsiveContainer width="100%" height="100%" debounce={80}>
            <PieChart>
              <Pie data={data} dataKey="value" innerRadius={26} outerRadius={36} startAngle={90} endAngle={-270} stroke="none" isAnimationActive={false}>
                <Cell fill={LIME} />
                <Cell fill="rgba(255,255,255,0.06)" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="text-[13px] font-bold tabular-nums" style={{ color: LIME }}>{marginRounded}%</div>
              <div className="text-[8px] text-white/40">margem</div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/[0.04]">
        {(() => {
          const demanda = n >= 20 ? "Alta" : n >= 5 ? "Média" : "Baixa";
          const dc = demanda === "Alta" ? LIME : demanda === "Média" ? "#fbbf24" : "#fb7185";
          const margemLabel = margin >= 55 ? "Saudável" : margin >= 35 ? "Ok" : "Baixa";
          const mc = margin >= 55 ? LIME : margin >= 35 ? "#fbbf24" : "#fb7185";
          const ticket = avgPrice;
          const tLabel = ticket >= 50 ? "Alto" : ticket >= 20 ? "Médio" : "Baixo";
          const tc = ticket >= 50 ? LIME : ticket >= 20 ? "#fbbf24" : "#fb7185";
          return [
            { l: "Demanda", v: demanda, c: dc },
            { l: "Margem", v: margemLabel, c: mc },
            { l: "Ticket médio", v: tLabel, c: tc },
          ];
        })().map((x, i) => (
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
    <Card glow="#a78bfa" className="cursor-pointer transition" onClick={() => onSelectTab?.(6)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-white">Produtos Mais Vendidos</h3>
        <button className="text-[11px] text-white/50 hover:text-white" onClick={(e) => { e.stopPropagation(); onSelectTab?.(6); }}>Ver todos</button>
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
    <Card glow="#047857">
      <h3 className="text-[14px] font-semibold text-white">Faturamento por Dia da Semana</h3>
      <p className="text-[11px] text-white/45 mb-3">Receita acumulada por dia da semana no mês</p>
      <div className="h-[180px] -mx-2 min-w-0">
        <ResponsiveContainer width="100%" height="100%" debounce={80}>
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
            <Area type="monotone" dataKey="v" stroke={LIME} strokeWidth={2} fill="url(#g1)" dot={{ r: 3, fill: LIME, stroke: "#0a0d0c", strokeWidth: 1 }} isAnimationActive={false}>
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
    <Card glow="#047857">
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
          <ResponsiveContainer width="100%" height="100%" debounce={80}>
            <PieChart>
              <Pie data={data} dataKey="v" innerRadius={38} outerRadius={52} startAngle={90} endAngle={-270} stroke="none" isAnimationActive={false}>
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
  tuyaDevices?: any[];
  onSelectTab?: (tab: number) => void;
}

export function Print3DPanel({
  orders = [],
  printers = [],
  filamentStocks = [],
  expenses = [],
  clients = [],
  tuyaDevices = [],
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
  // Clientes "balcão": clientes cadastrados com estoque consignado
  const balcaoClientsCount = clients.filter((c: any) => {
    const stockItems = Array.isArray(c?.productsStock) ? c.productsStock : [];
    const totalQty = stockItems.reduce((s: number, p: any) => s + (Number(p?.qty) || 0), 0);
    return totalQty > 0 || Number(c?.stockCount) > 0;
  }).length;
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
  // Fallback: search images from clients' productsStock entries
  clients.forEach((cli: any) => {
    (cli?.productsStock || []).forEach((p: any) => {
      const key = String(p?.name || "").toUpperCase().trim();
      if (key && !imageByName[key] && (p?.imageUrl || p?.image)) {
        imageByName[key] = p.imageUrl || p.image;
      }
    });
  });
  // Fallback: image from any order with that itemName
  orders.forEach((o: any) => {
    const key = String(o?.itemName || "").toUpperCase().trim();
    if (key && !imageByName[key] && (o?.imageUrl || o?.image)) {
      imageByName[key] = o.imageUrl || o.image;
    }
  });
  const prevMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1).getTime();
  const salesThis: Record<string, number> = {};
  const salesPrev: Record<string, number> = {};
  orders.forEach((o: any) => {
    if (o.status === "WAITING") return;
    const ts = o.createdAt || 0;
    const k = o.itemName || "Peça Personalizada";
    const q = o.quantity || 1;
    if (ts >= monthStart) salesThis[k] = (salesThis[k] || 0) + q;
    else if (ts >= prevMonthStart) salesPrev[k] = (salesPrev[k] || 0) + q;
  });
  const topProducts = Object.entries(salesThis)
    .map(([name, sales]) => {
      const prev = salesPrev[name] || 0;
      const trend = prev === 0
        ? (sales > 0 ? 100 : 0)
        : Math.round(((sales - prev) / prev) * 100);
      return {
        name,
        sales,
        trend,
        image: imageByName[name.toUpperCase().trim()],
      };
    })
    .sort((a, b) => b.sales - a.sales)
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
      {/* Hero + KPI strip — image fades down into dashboard */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#050908]">
        {/* Background image stretches behind hero + KPIs */}
        <img
          src={dashboardHero.url}
          alt="Ateliê 3D em produção"
          className="pointer-events-none absolute inset-x-0 top-0 w-full h-full object-cover"
          style={{ objectPosition: "center 78%" }}
          loading="lazy"
          decoding="async"
        />
        {/* Left fade for title legibility */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#050908] via-[#050908]/55 to-transparent" />
        {/* Bottom fade — image dissolves into dashboard */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-b from-transparent via-[#050908]/85 to-[#050908]" />

        {/* Hero band */}
        <div className="relative z-10 flex flex-col justify-between gap-5 p-5 lg:p-7" style={{ minHeight: "clamp(180px, 22vw, 280px)" }}>
          <div>
            <h1 className="text-[22px] lg:text-[26px] font-bold tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              Bem-vindo de volta, Inova Mundo! <span className="inline-block">👋</span>
            </h1>
            <p className="text-[12.5px] lg:text-[13px] text-white/70">Aqui está o resumo da sua produção hoje.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-black/40 border border-white/[0.1] text-[12px] text-white/85 hover:bg-black/60 backdrop-blur-sm">
              <Calendar className="size-3.5" />{" "}
              {today.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}{" "}
              <ChevronDown className="size-3" />
            </button>
            <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-black/40 border border-white/[0.1] text-[12px] text-white/85 hover:bg-black/60 backdrop-blur-sm">
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

        {/* KPI strip — sits over the faded bottom of the image */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 p-4 pt-0">
        <PremiumKpi tone="lime"    icon={ShoppingBag} label="Pedidos Hoje"       value={String(ordersToday.length)} sub={`${activePrinters}/${printersTotal} impressoras`} />
        <PremiumKpi tone="emerald" icon={DollarSign}  label="Faturamento Hoje"   value={fmtBRL(revenueToday)}       sub="receita do dia" />
        <PremiumKpi tone="blue"    icon={Package2}    label="Peças Impressas"    value={String(piecesToday)}        sub="hoje" />
        <PremiumKpi tone="purple"  icon={Clock}       label="Horas de Impressão" value={hoursLabel}                 sub="hoje" />
        <PremiumKpi tone="cyan"    icon={Users}       label="Clientes c/ Estoque" value={String(balcaoClientsCount)} sub="balcão" />
        <PremiumKpi tone="gold"    icon={TrendingUp}  label="Margem do Mês"      value={`${monthMargin.toFixed(1)}%`} sub={fmtBRL(monthProfit)} />
      </div>
      </div>

          {/* Row 2: Mapa | Impressão ao Vivo | Pedidos | Higrômetros */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 [&>*]:h-[260px]">
            <LivePrinters printers={printers} orders={orders} onSelectTab={onSelectTab} />
            <div className="md:col-span-2 xl:col-span-2 h-full [&>*]:h-full">
              <OrdersList orders={orders} clients={clients} onSelectTab={onSelectTab} />
            </div>
            <StockOverview filaments={filamentStocks} onSelectTab={onSelectTab} />
          </div>

          {/* Row 3: STL | Estoque Crítico | Cotação | IA Precificação */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch [&>*]:min-h-[260px]">
            <div className="md:col-span-2 xl:col-span-1 h-full [&>*]:h-full"><StlGallery orders={orders} clients={clients} /></div>
            <Hygrometers devices={tuyaDevices} onSelectTab={onSelectTab} />
            <FilamentQuotes onSelectTab={onSelectTab} />
            <AiPricing orders={orders} onSelectTab={onSelectTab} />
          </div>

          {/* Row 4: Categorias | Hora | Resumo Financeiro */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <TopProductsChart data={topProducts} onSelectTab={onSelectTab} />
            <HourlyChart data={hourly} />
            <FinanceSummary revenue={monthRevenue} expense={monthExpenses} profit={monthProfit} margin={monthMargin} onSelectTab={onSelectTab} />
          </div>

          {/* Row 5: Mapa de Clientes — último bloco, grande e cobrindo a tela */}
          <section id="dashboard-client-map-bottom" className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#050908] shadow-[0_28px_80px_-34px_rgba(163,230,53,0.45)]">
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] bg-[#0a0d0c]/95 px-5 py-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: LIME }}>Aqui embaixo</div>
                <h3 className="text-[18px] font-bold text-white">Mapa de Clientes</h3>
                <p className="text-[11px] text-white/45">{clients.length} clientes cadastrados</p>
              </div>
            </div>
            <div className="relative h-[calc(100vh-120px)] min-h-[720px] w-full bg-[#050908]">
              <div className="absolute inset-0 grid place-items-center text-[12px] text-white/35">Carregando mapa...</div>
              <ClientsMap clients={clients} />
            </div>
          </section>
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