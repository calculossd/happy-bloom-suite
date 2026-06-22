import { useEffect, useState } from "react";
import { LayoutDashboard, Printer, Users, Plug, Calculator, Settings, Store, Wifi } from "lucide-react";
import { usePrinters, useBrand } from "@/lib/g3d/store";
import { applyVisualTheme } from "@/lib/g3d/utils";

export const TABS = [
  { label: "Painel", icon: LayoutDashboard },
  { label: "Produção", icon: Printer },
  { label: "Clientes", icon: Users },
  { label: "Integrações", icon: Plug },
  { label: "Custos", icon: Calculator },
  { label: "Ajustes", icon: Settings },
  { label: "Vitrine", icon: Store },
] as const;

export function Header({ blink }: { blink: boolean }) {
  const { printers } = usePrinters();
  const { brand } = useBrand();
  const anyPrinting = printers.some((p) => p.status === "PRINTING");

  useEffect(() => {
    applyVisualTheme(brand.theme);
  }, [brand.theme]);

  return (
    <header
      className="sticky top-3 z-40 mx-auto mt-3 grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-[2rem] px-4 py-3 backdrop-blur-2xl sm:px-6"
      style={{
        background: "color-mix(in oklab, var(--brand-bg) 60%, transparent)",
        border: "1px solid var(--hairline)",
        boxShadow: "0 8px 32px -12px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.04) inset",
      }}
    >
      <div className="flex min-w-0 items-center gap-3">
        {brand.logoUrl ? (
          <img src={brand.logoUrl} alt={brand.name} className="h-10 w-10 shrink-0 rounded-2xl object-cover ring-1 ring-white/10" />
        ) : (
          <div
            className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-sm font-black text-black"
            style={{
              background: "linear-gradient(135deg, color-mix(in oklab, var(--brand-primary) 90%, white), var(--brand-primary))",
              boxShadow: "0 6px 20px -6px var(--brand-primary-glow), inset 0 1px 0 rgba(255,255,255,0.3)",
            }}
          >
            3D
          </div>
        )}
        <div className="min-w-0 leading-tight">
          <div className="font-display truncate text-[15px] font-bold tracking-tight text-white">{brand.name}</div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-white/45">
            <span
              className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${anyPrinting ? "animate-soft-pulse" : ""}`}
              style={{
                background: anyPrinting ? "#10B981" : "#52525b",
                color: anyPrinting ? "rgba(16,185,129,0.4)" : "transparent",
                boxShadow: anyPrinting ? "0 0 12px #10B981" : "none",
              }}
            />
            <span className="truncate">{anyPrinting ? "Produção ativa" : "Ocioso · pronto"}</span>
          </div>
        </div>
      </div>
      <div className="hidden shrink-0 items-center gap-3 text-[11px] text-white/40 sm:flex">
        <span className="flex items-center gap-1.5 rounded-full border border-white/5 bg-white/[0.02] px-2.5 py-1 font-mono">
          <Wifi className="h-3 w-3" />
          192.168.0.0/24
        </span>
        {blink && (
          <span className="animate-tab-blink rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-1 font-medium text-amber-300">
            novos pedidos
          </span>
        )}
      </div>
    </header>
  );
}

export function Dock({
  current,
  onChange,
  blink,
}: {
  current: number;
  onChange: (i: number) => void;
  blink: boolean;
}) {
  return (
    <nav
      className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-full px-1.5 py-1.5 backdrop-blur-2xl"
      style={{
        background: "color-mix(in oklab, var(--brand-bg) 70%, transparent)",
        border: "1px solid var(--hairline-strong)",
        boxShadow: "0 20px 50px -12px rgba(0,0,0,0.7), 0 1px 0 rgba(255,255,255,0.06) inset",
      }}
    >
      <div className="flex items-center gap-0.5">
        {TABS.map((t, i) => {
          const Icon = t.icon;
          const active = current === i;
          return (
            <button
              key={t.label}
              onClick={() => onChange(i)}
              className={`group relative flex flex-col items-center justify-center rounded-full py-2.5 px-3.5 text-[10px] font-semibold tracking-tight transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                active ? "text-black" : "text-white/60 hover:text-white"
              } ${blink && i === 3 && !active ? "animate-pulse" : ""}`}
              style={
                active
                  ? {
                      background:
                        "linear-gradient(180deg, color-mix(in oklab, var(--brand-primary) 92%, white), var(--brand-primary))",
                      boxShadow:
                        "0 8px 24px -6px var(--brand-primary-glow), inset 0 1px 0 rgba(255,255,255,0.3)",
                    }
                  : undefined
              }
              aria-label={t.label}
            >
              <Icon
                className={`h-5 w-5 transition-transform duration-300 ${active ? "scale-110" : "group-hover:scale-105"}`}
                strokeWidth={2.2}
              />
              <span className="mt-0.5 hidden sm:block">{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function useShowcaseMode(): [boolean, (v: boolean) => void] {
  const [v, setV] = useState(false);
  return [v, setV];
}