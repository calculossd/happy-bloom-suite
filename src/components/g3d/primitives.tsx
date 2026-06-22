import type { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-3xl border border-white/5 p-5 backdrop-blur-xl ${className}`}
      style={{ background: "var(--brand-card)" }}
    >
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
    "inline-flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-sm font-medium transition-all active:scale-[0.98] disabled:opacity-50";
  const styles =
    variant === "primary"
      ? "text-black shadow-[0_4px_20px_rgba(244,110,31,0.4)]"
      : variant === "danger"
        ? "bg-red-500/15 text-red-300 hover:bg-red-500/25 border border-red-500/30"
        : variant === "outline"
          ? "border border-white/10 text-white/90 hover:bg-white/5"
          : "text-white/80 hover:bg-white/5";
  return (
    <button
      {...rest}
      className={`${base} ${styles} ${className}`}
      style={variant === "primary" ? { background: "var(--brand-primary)", ...rest.style } : rest.style}
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
      className={`w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-[var(--brand-primary)] focus:outline-none ${props.className ?? ""}`}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-[var(--brand-primary)] focus:outline-none ${props.className ?? ""}`}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white focus:border-[var(--brand-primary)] focus:outline-none ${props.className ?? ""}`}
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-white/10 p-6 max-h-[90vh] overflow-y-auto"
        style={{ background: "var(--brand-card)" }}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white">
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