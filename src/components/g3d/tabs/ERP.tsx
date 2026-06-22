import { useState } from "react";
import { Plug, RefreshCw, Wand2, Sparkles, CheckCircle2 } from "lucide-react";
import { Btn, Card, Field, Input, Modal, Pill } from "../primitives";
import { useOrders } from "@/lib/g3d/store";
import type { PlatformSource } from "@/lib/g3d/types";

const CHANNELS: { id: PlatformSource; label: string }[] = [
  { id: "MERCADO_LIVRE", label: "Mercado Livre" },
  { id: "SHOPEE", label: "Shopee" },
  { id: "NUVEMSHOP", label: "Nuvemshop" },
  { id: "AMAZON", label: "Amazon" },
  { id: "TIKTOK_SHOP", label: "TikTok Shop" },
];

export function ERPTab({ onPendingFound }: { onPendingFound: () => void }) {
  const { orders, addOrder } = useOrders();
  const [open, setOpen] = useState(false);
  const [tokens, setTokens] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem("g3d.tokens") ?? "{}");
    } catch { return {}; }
  });
  const [aiOpen, setAiOpen] = useState(false);
  const [aiResp, setAiResp] = useState<string[]>([]);

  const saveTokens = (next: Record<string, string>) => {
    setTokens(next);
    localStorage.setItem("g3d.tokens", JSON.stringify(next));
  };

  const syncPending = () => {
    const platforms = CHANNELS.filter((c) => tokens[c.id]);
    if (!platforms.length) {
      const fake: PlatformSource[] = ["MERCADO_LIVRE", "SHOPEE"];
      fake.forEach((p, i) =>
        addOrder({
          clientName: `Cliente ${p} #${Math.floor(Math.random() * 999)}`,
          itemName: i === 0 ? "Miniatura Dragão" : "Suporte Switch",
          quantity: 1,
          filamentType: "PLA",
          filamentColor: "Aleatório",
          weightGrams: 80 + i * 30,
          printTimeHours: 3 + i,
          priceCharged: 70 + i * 25,
          createdAt: Date.now(),
          deadline: Date.now() + 5 * 86_400_000,
          platformSource: p,
          status: "WAITING",
          printingProgress: 0,
          paymentStatus: "PAGO",
        }),
      );
    } else {
      platforms.forEach((p) =>
        addOrder({
          clientName: `Pedido ${p.label}`,
          itemName: "Item importado",
          quantity: 1,
          filamentType: "PLA",
          filamentColor: "—",
          weightGrams: 100,
          printTimeHours: 4,
          priceCharged: 95,
          createdAt: Date.now(),
          deadline: Date.now() + 4 * 86_400_000,
          platformSource: p.id,
          status: "WAITING",
          printingProgress: 0,
          paymentStatus: "PAGO",
        }),
      );
    }
    onPendingFound();
  };

  const processQueue = () => {
    orders.filter((o) => o.status === "WAITING").forEach(() => {
      /* In real life would auto-link; here we just leave them visible */
    });
    alert("Pedidos pendentes processados e movidos para a fila.");
    orders.filter((o) => o.status === "WAITING").forEach((o) => {
      o.status = "QUEUE";
    });
  };

  const askOkLoja = () => {
    const last30 = orders.filter((o) => o.createdAt > Date.now() - 30 * 86_400_000);
    const topType = last30.reduce<Record<string, number>>((acc, o) => ({ ...acc, [o.filamentType]: (acc[o.filamentType] ?? 0) + 1 }), {});
    const top = Object.entries(topType).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "PLA";
    setAiResp([
      `Modelo sugerido: Vaso geométrico em ${top} — alta demanda em 30 dias.`,
      `Tendência: organizadores de mesa com peça única (margem 65%+).`,
      `Oportunidade: kits de miniaturas RPG em PLA — ticket médio R$ 180.`,
      `Diversificar cores: branco fosco e verde militar estão em alta.`,
    ]);
    setAiOpen(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-white">Integração ERP & OkLoja Intelligence</h2>
        <div className="flex flex-wrap gap-2">
          <Btn onClick={() => setOpen(true)}><Plug className="h-4 w-4" /> Conectar Canais</Btn>
          <Btn variant="outline" onClick={syncPending}><RefreshCw className="h-4 w-4" /> Sincronizar Pedidos</Btn>
          <Btn variant="outline" onClick={processQueue}><Wand2 className="h-4 w-4" /> Processar & Vincular</Btn>
          <Btn variant="ghost" onClick={askOkLoja}><Sparkles className="h-4 w-4" /> OkLoja AI</Btn>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CHANNELS.map((c) => (
          <Card key={c.id}>
            <div className="flex items-center justify-between">
              <div className="font-semibold text-white">{c.label}</div>
              <Pill tone={tokens[c.id] ? "green" : "muted"}>
                {tokens[c.id] ? <><CheckCircle2 className="h-3 w-3" /> conectado</> : "desconectado"}
              </Pill>
            </div>
            <div className="mt-2 text-xs text-white/40">
              {tokens[c.id] ? "API key salva localmente" : "Sem credenciais"}
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="mb-3 text-sm font-semibold text-white/80">Pedidos importados (aguardando)</h3>
        <div className="divide-y divide-white/5">
          {orders.filter((o) => o.status === "WAITING").map((o) => (
            <div key={o.id} className="flex items-center justify-between py-2 text-sm">
              <div>
                <div className="text-white">{o.itemName}</div>
                <div className="text-xs text-white/40">{o.platformSource} · {o.clientName}</div>
              </div>
              <Pill tone="amber">WAITING</Pill>
            </div>
          ))}
          {!orders.some((o) => o.status === "WAITING") && (
            <div className="py-6 text-center text-sm text-white/40">Nenhum pedido aguardando importação.</div>
          )}
        </div>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Conectar Canais Eletrônicos">
        <div className="space-y-3">
          {CHANNELS.map((c) => (
            <Field key={c.id} label={`${c.label} — Token / API Key`}>
              <Input
                value={tokens[c.id] ?? ""}
                onChange={(e) => saveTokens({ ...tokens, [c.id]: e.target.value })}
                placeholder="cole o token aqui"
              />
            </Field>
          ))}
          <Btn onClick={() => setOpen(false)}>Salvar</Btn>
        </div>
      </Modal>

      <Modal open={aiOpen} onClose={() => setAiOpen(false)} title="OkLoja Assistant — Análise de Mercado">
        <ul className="space-y-2 text-sm text-white/80">
          {aiResp.map((r, i) => (
            <li key={i} className="flex gap-2"><Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-primary)]" />{r}</li>
          ))}
        </ul>
      </Modal>
    </div>
  );
}