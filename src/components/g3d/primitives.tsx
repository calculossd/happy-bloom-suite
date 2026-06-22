import type { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`group/card relative overflow-hidden rounded-3xl p-6 transition-all duration-500 ${className}`}
      style={{
        background: "linear-gradient(180deg, var(--surface-2), var(--surface-1))",
        border: "1px solid var(--hairline)",
        boxShadow: "var(--shadow-soft)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, var(--hairline-strong), transparent)" }}
      />
      {children}
    </div>
  );
}

export function Btn({
  children,
  variant = "primary",
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" | "outline" }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-sm font-medium tracking-tight transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";
  const styles =
    variant === "primary"
      ? "text-black hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)]"
      : variant === "danger"
        ? "bg-red-500/10 text-red-300 hover:bg-red-500/20 border border-red-500/25 hover:border-red-500/40"
        : variant === "outline"
          ? "border border-white/10 text-white/90 hover:bg-white/5 hover:border-white/20"
          : "text-white/70 hover:bg-white/[0.04] hover:text-white";
  return (
    <button
      {...rest}
      className={`${base} ${styles} ${className}`}
      style={
        variant === "primary"
          ? {
              background:
                "linear-gradient(180deg, color-mix(in oklab, var(--brand-primary) 92%, white), var(--brand-primary))",
              boxShadow: "0 1px 0 rgba(255,255,255,0.25) inset, 0 8px 24px -8px var(--brand-primary-glow)",
              ...rest.style,
            }
          : rest.style
      }
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] uppercase tracking-wider text-white/50">{label}</span>
      {children}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 transition-colors duration-200 focus:border-[var(--brand-primary)]/60 focus:bg-black/40 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 ${props.className ?? ""}`}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 transition-colors duration-200 focus:border-[var(--brand-primary)]/60 focus:bg-black/40 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 ${props.className ?? ""}`}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-sm text-white transition-colors duration-200 focus:border-[var(--brand-primary)]/60 focus:bg-black/40 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 ${props.className ?? ""}`}
    />
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-md sm:items-center sm:p-4 animate-fade-up"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-6 sm:p-7"
        style={{
          background: "linear-gradient(180deg, var(--surface-2), var(--surface-1))",
          border: "1px solid var(--hairline-strong)",
          boxShadow: "0 30px 80px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset",
        }}
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-display text-xl font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-white/50 transition-all hover:bg-white/10 hover:text-white hover:rotate-90 duration-300"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Pill({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "primary" | "green" | "amber" | "red" | "blue" }) {
  const tones = {
    muted: "bg-white/5 text-white/60 border-white/10",
    primary: "text-black border-transparent",
    green: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    amber: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    red: "bg-red-500/15 text-red-300 border-red-500/30",
    blue: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${tones[tone]}`}
      style={tone === "primary" ? { background: "var(--brand-primary)" } : undefined}
    >
      {children}
    </span>
  );
}