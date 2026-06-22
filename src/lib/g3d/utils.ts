import type { AppState, FilamentStock, OrderStatus, PrintOrder } from "./types";

export const BRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const PCT = (n: number) => `${(n * 100).toFixed(1)}%`;

export function maskPhone(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export const traduzirStatus = (s: OrderStatus) =>
  ({
    WAITING: "Aguardando",
    QUEUE: "Na Fila",
    PRINTING: "Imprimindo",
    POST_PROCESS: "Pós-Processamento",
    READY: "Pronto para Retirada",
    DELIVERED: "Entregue",
  }[s]);

export function whatsappLink(clientPhone: string, clientName: string, order: PrintOrder) {
  const msg =
    `Olá ${clientName}! Aqui é do Ateliê 3D. Passando para atualizar o status do` +
    ` seu pedido: *${order.itemName}* no momento está no estágio de *${traduzirStatus(order.status)}*.` +
    ` Estamos cuidando de cada detalhe com a máxima precisão operacional!`;
  const phone = clientPhone.replace(/\D/g, "");
  return `https://api.whatsapp.com/send?phone=55${phone}&text=${encodeURIComponent(msg)}`;
}

export const THEMES = {
  bambuzau: { primary: "#F46E1F", bg: "#0A0A0B", card: "#121215", label: "Bambuzau (Amber)" },
  cyberpunk: { primary: "#00F0FF", bg: "#0A0612", card: "#1A0C2E", label: "Cyberpunk" },
  mint: { primary: "#10B981", bg: "#060F0C", card: "#0D1F1A", label: "Mint Forest" },
  obsidian: { primary: "#EF4444", bg: "#090909", card: "#141414", label: "Obsidian" },
} as const;

export type ThemeName = keyof typeof THEMES;

export function applyVisualTheme(name: ThemeName) {
  const t = THEMES[name];
  const r = document.documentElement.style;
  r.setProperty("--brand-primary", t.primary);
  r.setProperty("--brand-bg", t.bg);
  r.setProperty("--brand-card", t.card);
}

export function normalizeDropbox(url: string) {
  if (!url) return url;
  if (url.includes("dropbox.com")) return url.replace(/\?dl=0/, "?dl=1").replace(/&dl=0/, "&dl=1");
  return url;
}

export const APP_SIGNATURE = "Gestao3D_Backup";

export function serializeBackup(state: AppState) {
  return JSON.stringify({ app_signature: APP_SIGNATURE, version: 1, exportedAt: Date.now(), data: state });
}

export function parseBackup(text: string): AppState | null {
  try {
    const obj = JSON.parse(text);
    if (obj?.app_signature !== APP_SIGNATURE) return null;
    return obj.data as AppState;
  } catch {
    return null;
  }
}

/** Bobina Killer: combina rolos com baixo estoque (<250g) até completar `target` gramas. */
export function calcEmenda(filaments: FilamentStock[], type: string, target: number) {
  const candidates = filaments
    .filter((f) => f.type === type && f.stockGrams > 0 && f.stockGrams < 250)
    .sort((a, b) => b.stockGrams - a.stockGrams);
  const used: { id: number; color: string; grams: number }[] = [];
  let remaining = target;
  for (const f of candidates) {
    if (remaining <= 0) break;
    const take = Math.min(f.stockGrams, remaining);
    used.push({ id: f.id, color: f.color, grams: take });
    remaining -= take;
  }
  return { used, covered: target - remaining, remaining, feasible: remaining <= 0 };
}

export function downloadJson(filename: string, payload: string) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { AndroidInterface?: { saveFile?: (n: string, c: string) => void } };
  if (w.AndroidInterface?.saveFile) {
    w.AndroidInterface.saveFile(filename, payload);
    return;
  }
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function toCSV(rows: Record<string, string | number>[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  return [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h] ?? "")).join(","))].join("\n");
}

export function downloadCSV(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}