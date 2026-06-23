import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Send,
  Settings2,
  CheckCircle2,
  XCircle,
  Loader2,
  Package,
  Truck,
  ShoppingCart,
  DollarSign,
  Hammer,
  CalendarClock,
} from "lucide-react";

type SendState = "idle" | "sending" | "ok" | "err";
type Event = {
  id: string;
  date: string;
  title: string;
  time?: string;
  notes?: string;
  hermesSentAt?: number;
  hermesStatus?: SendState;
  hermesError?: string;
};

const STORAGE_KEY = "agenda-events-v1";
const HERMES_CFG_KEY = "agenda-hermes-cfg-v1";

type HermesCfg = { url: string; secret: string; auto: boolean };
const DEFAULT_CFG: HermesCfg = { url: "", secret: "", auto: false };

function fmt(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fmtTs(ts: number) {
  if (!ts) return "";
  const d = new Date(ts);
  return fmt(d);
}

function brl(n: number) {
  return (Number(n) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type DerivedItem = {
  kind: "sale" | "delivery" | "expense" | "pending" | "shopping" | "produced";
  title: string;
  meta?: string;
  amount?: number;
};

const TONE: Record<string, string> = {
  emerald: "border-emerald-400/20 bg-emerald-500/5 text-emerald-200",
  cyan: "border-cyan-400/20 bg-cyan-500/5 text-cyan-200",
  amber: "border-amber-400/20 bg-amber-500/5 text-amber-200",
  rose: "border-rose-400/20 bg-rose-500/5 text-rose-200",
};

function SummaryGroup({
  icon,
  label,
  tone,
  items,
}: {
  icon: React.ReactNode;
  label: string;
  tone: "emerald" | "cyan" | "amber" | "rose";
  items: DerivedItem[];
}) {
  return (
    <div className={`rounded-xl border p-3 ${TONE[tone]}`}>
      <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-semibold">
        {icon} {label} <span className="text-white/40">· {items.length}</span>
      </p>
      <ul className="space-y-1 text-xs text-white/80">
        {items.slice(0, 6).map((it, i) => (
          <li key={i} className="flex justify-between gap-2">
            <span className="truncate">
              {it.title}
              {it.meta && <span className="ml-1 text-white/40">· {it.meta}</span>}
            </span>
            {typeof it.amount === "number" && it.amount > 0 && (
              <span className="shrink-0 text-white/50">{brl(it.amount)}</span>
            )}
          </li>
        ))}
        {items.length > 6 && (
          <li className="text-white/30">+{items.length - 6} itens…</li>
        )}
      </ul>
    </div>
  );
}

async function sendToHermes(cfg: HermesCfg, ev: Event) {
  if (!cfg.url) throw new Error("Webhook do Hermes não configurado");
  const res = await fetch(cfg.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cfg.secret ? { Authorization: `Bearer ${cfg.secret}` } : {}),
    },
    body: JSON.stringify({
      source: "impremetrics-agenda",
      event: {
        id: ev.id,
        title: ev.title,
        date: ev.date,
        time: ev.time ?? null,
        notes: ev.notes ?? null,
        datetimeISO: ev.time
          ? new Date(`${ev.date}T${ev.time}:00`).toISOString()
          : new Date(`${ev.date}T00:00:00`).toISOString(),
      },
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

function AgendaPage() {
  const [mounted, setMounted] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [cursor, setCursor] = useState<Date | null>(null);
  const [selected, setSelected] = useState<string>("");
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [cfg, setCfg] = useState<HermesCfg>(DEFAULT_CFG);
  const [showCfg, setShowCfg] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [shopping, setShopping] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<any[]>([]);

  // Mount-only date init (avoids SSR/CSR hydration mismatch)
  useEffect(() => {
    const d = new Date();
    setCursor(new Date(d.getFullYear(), d.getMonth(), 1));
    setSelected(fmt(d));
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setEvents(JSON.parse(raw));
      const rawCfg = localStorage.getItem(HERMES_CFG_KEY);
      if (rawCfg) setCfg({ ...DEFAULT_CFG, ...JSON.parse(rawCfg) });
    } catch {}
    const loadData = () => {
      try {
        setOrders(JSON.parse(localStorage.getItem("bambuzau_orders") || "[]"));
        setExpenses(JSON.parse(localStorage.getItem("bambuzau_expenses") || "[]"));
        setShopping(JSON.parse(localStorage.getItem("bambuzau_shopping") || "[]"));
        setCatalog(JSON.parse(localStorage.getItem("bambuzau_local_catalog_production") || "[]"));
      } catch {}
    };
    loadData();
    const onStorage = () => loadData();
    window.addEventListener("storage", onStorage);
    const t = window.setInterval(loadData, 4000);
    return () => { window.removeEventListener("storage", onStorage); window.clearInterval(t); };
  }, []);

  useEffect(() => {
    if (mounted) localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events, mounted]);
  useEffect(() => {
    if (mounted) localStorage.setItem(HERMES_CFG_KEY, JSON.stringify(cfg));
  }, [cfg, mounted]);

  const cells = useMemo(() => {
    if (!cursor) return [];
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const startDow = first.getDay();
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const arr: { date: string; day: number; inMonth: boolean }[] = [];
    for (let i = 0; i < startDow; i++) {
      const d = new Date(first);
      d.setDate(d.getDate() - (startDow - i));
      arr.push({ date: fmt(d), day: d.getDate(), inMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(cursor.getFullYear(), cursor.getMonth(), i);
      arr.push({ date: fmt(d), day: i, inMonth: true });
    }
    while (arr.length % 7 !== 0 || arr.length < 42) {
      const last = new Date(arr[arr.length - 1].date);
      last.setDate(last.getDate() + 1);
      arr.push({ date: fmt(last), day: last.getDate(), inMonth: false });
      if (arr.length >= 42) break;
    }
    return arr;
  }, [cursor]);

  const monthLabel = cursor
    ? cursor.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    : "";
  const today = mounted ? fmt(new Date()) : "";

  // Build a date → derived items map from orders/expenses/shopping
  const derivedByDate = useMemo(() => {
    const map = new Map<string, DerivedItem[]>();
    const push = (date: string, item: DerivedItem) => {
      if (!date) return;
      if (!map.has(date)) map.set(date, []);
      map.get(date)!.push(item);
    };
    for (const o of orders) {
      const created = o.createdAt ? fmtTs(o.createdAt) : "";
      const due = o.deadline ? fmtTs(o.deadline) : "";
      const label = `${o.itemName || "Item"} × ${o.quantity || 1}`;
      const meta = o.clientName ? `Cliente: ${o.clientName}` : undefined;
      if (created) push(created, { kind: "sale", title: label, meta, amount: o.priceCharged });
      if (due) {
        if (o.status === "DELIVERED") {
          push(due, { kind: "delivery", title: `Entrega: ${label}`, meta });
        } else {
          push(due, { kind: "pending", title: `Pendente: ${label}`, meta: `${o.status || ""}${meta ? " · " + meta : ""}` });
        }
      }
    }
    for (const e of expenses) {
      const d = e.date ? fmtTs(e.date) : "";
      if (!d) continue;
      push(d, {
        kind: "expense",
        title: `${e.description || "Compra"}${e.qty > 1 ? ` × ${e.qty}` : ""}`,
        meta: e.category,
        amount: e.amount,
      });
    }
    return map;
  }, [orders, expenses]);

  const pendingShopping = useMemo(
    () => shopping.filter((s) => !s.isChecked),
    [shopping],
  );

  const lowStockCatalog = useMemo(
    () => catalog.filter((c) => Number(c.stockCount ?? 0) < Number(c.minStockCount ?? 0)),
    [catalog],
  );

  const isPast = selected && today ? selected < today : false;
  const isFuture = selected && today ? selected > today : false;

  const dayDerived = derivedByDate.get(selected) || [];
  const daySales = dayDerived.filter((d) => d.kind === "sale");
  const dayDeliveries = dayDerived.filter((d) => d.kind === "delivery");
  const dayExpenses = dayDerived.filter((d) => d.kind === "expense");
  const dayPending = dayDerived.filter((d) => d.kind === "pending");

  const totalSales = daySales.reduce((s, x) => s + (Number(x.amount) || 0), 0);
  const totalSpent = dayExpenses.reduce((s, x) => s + (Number(x.amount) || 0), 0);

  const dayEvents = events
    .filter((e) => e.date === selected)
    .sort((a, b) => (a.time || "").localeCompare(b.time || ""));

  const updateEvent = (id: string, patch: Partial<Event>) =>
    setEvents((x) => x.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  const trySend = async (ev: Event) => {
    updateEvent(ev.id, { hermesStatus: "sending", hermesError: undefined });
    try {
      await sendToHermes(cfg, ev);
      updateEvent(ev.id, { hermesStatus: "ok", hermesSentAt: Date.now() });
    } catch (e: any) {
      updateEvent(ev.id, { hermesStatus: "err", hermesError: e?.message || "Falha" });
    }
  };

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selected) return;
    const ev: Event = {
      id: crypto.randomUUID(),
      date: selected,
      title: title.trim(),
      time: time || undefined,
    };
    setEvents((x) => [...x, ev]);
    setTitle("");
    setTime("");
    if (cfg.auto && cfg.url) {
      // fire-and-forget; UI updates via state
      void trySend(ev);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#050507] text-white">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 right-1/4 h-[420px] w-[420px] rounded-full bg-violet-500/10 blur-[140px]" />
        <div className="absolute bottom-0 left-1/4 h-[380px] w-[380px] rounded-full bg-cyan-500/10 blur-[140px]" />
      </div>
      <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1600px] px-6 py-12 md:px-10">
        <header className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.3em] text-violet-400">
              Produtividade
            </p>
            <h1
              className="text-4xl font-extrabold tracking-tight md:text-5xl"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Agenda
            </h1>
            <p className="mt-2 text-sm text-white/50">
              Visão mensal · integrada ao Hermes via webhook.
            </p>
          </div>
          <button
            onClick={() => setShowCfg((v) => !v)}
            className={`inline-flex items-center gap-2 self-start rounded-xl border px-3.5 py-2 text-xs transition-all ${
              cfg.url
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            <Settings2 className="h-3.5 w-3.5" />
            {cfg.url ? "Hermes conectado" : "Conectar Hermes"}
          </button>
        </header>

        {/* Hermes config panel */}
        {showCfg && (
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
            <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-white/40">
              Integração Hermes (Webhook)
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block text-xs">
                <span className="text-white/60">URL do Webhook</span>
                <input
                  value={cfg.url}
                  onChange={(e) => setCfg((c) => ({ ...c, url: e.target.value }))}
                  placeholder="https://hermes.exemplo.com/api/webhooks/agenda"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white placeholder:text-white/30 focus:border-cyan-400/50 focus:outline-none"
                />
              </label>
              <label className="block text-xs">
                <span className="text-white/60">Token / Secret (opcional)</span>
                <input
                  value={cfg.secret}
                  onChange={(e) => setCfg((c) => ({ ...c, secret: e.target.value }))}
                  type="password"
                  placeholder="Bearer token"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white placeholder:text-white/30 focus:border-cyan-400/50 focus:outline-none"
                />
              </label>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-white/70">
                <input
                  type="checkbox"
                  checked={cfg.auto}
                  onChange={(e) => setCfg((c) => ({ ...c, auto: e.target.checked }))}
                  className="h-3.5 w-3.5 accent-cyan-400"
                />
                Enviar automaticamente ao criar
              </label>
              <p className="text-[10px] text-white/30">
                POST JSON · header <code>Authorization: Bearer …</code> quando preenchido.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Calendar */}
          <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl">
            <div className="mb-6 flex items-center justify-between">
              <h3
                className="text-lg font-semibold capitalize"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                {monthLabel || "\u00a0"}
              </h3>
              <div className="flex gap-1">
                <button
                  onClick={() =>
                    setCursor((c) =>
                      c ? new Date(c.getFullYear(), c.getMonth() - 1, 1) : c,
                    )
                  }
                  className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 hover:bg-white/10"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    const d = new Date();
                    setCursor(new Date(d.getFullYear(), d.getMonth(), 1));
                    setSelected(fmt(d));
                  }}
                  className="rounded-lg border border-white/10 px-3 text-xs hover:bg-white/10"
                >
                  Hoje
                </button>
                <button
                  onClick={() =>
                    setCursor((c) =>
                      c ? new Date(c.getFullYear(), c.getMonth() + 1, 1) : c,
                    )
                  }
                  className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 hover:bg-white/10"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-widest text-white/40">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {!mounted
                ? Array.from({ length: 42 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-xl border border-white/5"
                    />
                  ))
                : cells.map((cell) => {
                    const isToday = cell.date === today;
                    const isSel = cell.date === selected;
                    return (
                      <button
                        key={cell.date + cell.day}
                        onClick={() => setSelected(cell.date)}
                        className={`aspect-square grid place-items-center rounded-xl border text-xs transition-all
                          ${isSel ? "border-cyan-400/60 bg-cyan-500/10" : "border-white/5 hover:border-white/20"}
                          ${cell.inMonth ? "text-white" : "text-white/20"}`}
                      >
                        <span className={isToday ? "font-bold text-cyan-300" : ""}>
                          {cell.day}
                        </span>
                      </button>
                    );
                  })}
            </div>
          </div>

          {/* Day events */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/70">
              {mounted && selected
                ? new Date(selected + "T00:00").toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                  })
                : "\u00a0"}
            </h3>

            <ul className="mb-4 min-h-[80px] space-y-2">
              {dayEvents.length === 0 && (
                <li className="text-xs text-white/30">Sem compromissos.</li>
              )}
              {dayEvents.map((ev) => {
                const st = ev.hermesStatus ?? "idle";
                return (
                  <li
                    key={ev.id}
                    className="group rounded-xl border border-white/10 bg-white/5 p-3"
                  >
                    <div className="flex items-start gap-3">
                      {ev.time && (
                        <span
                          className="shrink-0 text-[11px] text-cyan-300"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          {ev.time}
                        </span>
                      )}
                      <span className="flex-1 text-sm">{ev.title}</span>
                      <button
                        onClick={() =>
                          setEvents((x) => x.filter((e) => e.id !== ev.id))
                        }
                        className="text-white/40 opacity-0 transition-opacity group-hover:opacity-100 hover:text-rose-400"
                        aria-label="Remover"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2 pl-0">
                      <button
                        onClick={() => trySend(ev)}
                        disabled={!cfg.url || st === "sending"}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-1 text-[10px] text-cyan-200 transition-all hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {st === "sending" ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Send className="h-3 w-3" />
                        )}
                        {st === "sending" ? "Enviando…" : "Enviar ao Hermes"}
                      </button>
                      {st === "ok" && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" /> Enviado
                        </span>
                      )}
                      {st === "err" && (
                        <span
                          title={ev.hermesError}
                          className="inline-flex items-center gap-1 text-[10px] text-rose-300"
                        >
                          <XCircle className="h-3 w-3" /> Falha
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            <form onSubmit={add} className="space-y-2">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Compromisso…"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs focus:border-cyan-400/50 focus:outline-none"
              />
              <div className="flex gap-2">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs focus:border-cyan-400/50 focus:outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 text-xs font-bold text-black hover:bg-cyan-300 active:scale-95"
                >
                  <Plus className="h-3.5 w-3.5" /> Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgendaPage;
