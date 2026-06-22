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
    <header className="sticky top-3 z-40 mx-auto mt-3 flex max-w-6xl items-center justify-between rounded-[2rem] border border-white/5 bg-black/40 px-4 py-3 backdrop-blur-3xl sm:px-6">
      <div className="flex items-center gap-3">
        {brand.logoUrl ? (
          <img src={brand.logoUrl} alt={brand.name} className="h-9 w-9 rounded-xl object-cover" />
        ) : (
          <div
            className="grid h-9 w-9 place-items-center rounded-xl text-sm font-black text-black"
            style={{ background: "var(--brand-primary)" }}
          >
            3D
          </div>
        )}
        <div className="leading-tight">
          <div className="text-sm font-bold text-white">{brand.name}</div>
          <div className="flex items-center gap-1.5 text-[11px] text-white/50">
            <span
              className={`inline-block h-2 w-2 rounded-full ${anyPrinting ? "animate-pulse" : ""}`}
              style={{ background: anyPrinting ? "#10B981" : "#3f3f46", boxShadow: anyPrinting ? "0 0 10px #10B981" : "none" }}
            />
            {anyPrinting ? "Produção ativa" : "Ocioso"}
          </div>
        </div>
      </div>
      <div className="hidden items-center gap-3 text-[11px] text-white/40 sm:flex">
        <Wifi className="h-3.5 w-3.5" />
        <span>LAN 192.168.0.0/24</span>
        {blink && (
          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-amber-300">novos pedidos</span>
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
    <nav className="fixed bottom-3 left-1/2 z-40 -translate-x-1/2 rounded-full border border-white/10 bg-black/60 px-2 py-2 backdrop-blur-3xl">
      <div className="flex items-center gap-1">
        {TABS.map((t, i) => {
          const Icon = t.icon;
          const active = current === i;
          return (
            <button
              key={t.label}
              onClick={() => onChange(i)}
              className={`group relative flex flex-col items-center justify-center rounded-full py-2.5 px-3 text-[10px] font-semibold transition-all ${
                active ? "text-black" : "text-white/60 hover:text-white"
              } ${blink && i === 3 && !active ? "animate-pulse" : ""}`}
              style={
                active
                  ? {
                      background: "var(--brand-primary)",
                      boxShadow: "0 4px 20px rgba(244,110,31,0.4)",
                    }
                  : undefined
              }
              aria-label={t.label}
            >
              <Icon className={`h-5 w-5 ${active ? "scale-105" : ""}`} strokeWidth={2.2} />
              <span className={`mt-0.5 hidden sm:block`}>{t.label}</span>
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