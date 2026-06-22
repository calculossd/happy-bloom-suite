import { useMemo, useState } from "react";
import { AlertTriangle, DollarSign, TrendingUp, Package, Plus } from "lucide-react";
import { Card, Btn, Modal, Field, Input, Select } from "../primitives";
import { useBrand, useCatalog, useClients, useFilaments, useOrders } from "@/lib/g3d/store";
import { BRL } from "@/lib/g3d/utils";

type Range = 1 | 7 | 30;

export function PainelTab() {
  const { orders, addOrder } = useOrders();
  const { filaments } = useFilaments();
  const { brand, updateBrand } = useBrand();
  const { clients } = useClients();
  const { catalog } = useCatalog();

  const [range, setRange] = useState<Range>(7);
  const [openQuick, setOpenQuick] = useState(false);

  const filtered = useMemo(() => {
    const cutoff = Date.now() - range * 86_400_000;
    return orders.filter((o) => o.createdAt >= cutoff);
  }, [orders, range]);

  const faturamento = filtered
    .filter((o) => o.status === "DELIVERED" || o.status === "READY")
    .reduce((s, o) => s + o.priceCharged, 0);

  const margem = useMemo(() => {
    if (!filtered.length) return 0;
    let total = 0;
    let custo = 0;
    for (const o of filtered) {
      total += o.priceCharged;
      const fil = filaments.find((f) => f.type === o.filamentType);
      const cf = fil ? (o.weightGrams * (fil.priceRoll / 1000)) : o.weightGrams * 0.1;
      const ce = (120 / 1000) * o.printTimeHours * brand.kwhPrice;
      custo += cf + ce;
    }
    return total > 0 ? (total - custo) / total : 0;
  }, [filtered, filaments, brand.kwhPrice]);

  const auditAlert = Date.now() - brand.lastAuditDate > 3 * 86_400_000;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-white/40">Overview</div>
          <h2 className="font-display text-3xl font-black tracking-tight text-white sm:text-4xl">
            Painel de Controle
          </h2>
          <p className="mt-1 text-sm text-white/50">
            Visão geral em tempo real do seu ateliê de impressão 3D.
          </p>
        </div>
        <div className="flex shrink-0 gap-0.5 rounded-full border border-white/10 bg-black/40 p-1 backdrop-blur">
          {([1, 7, 30] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-tight transition-all duration-300 ${
                range === r ? "text-black" : "text-white/60"
              }`}
              style={
                range === r
                  ? {
                      background:
                        "linear-gradient(180deg, color-mix(in oklab, var(--brand-primary) 92%, white), var(--brand-primary))",
                      boxShadow: "0 4px 14px -4px var(--brand-primary-glow)",
                    }
                  : undefined
              }
            >
              {r === 1 ? "Hoje" : `${r} dias`}
            </button>
          ))}
        </div>
      </div>

      {auditAlert && (
        <div className="animate-fade-up flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/[0.08] p-4 text-red-200 backdrop-blur">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div className="flex-1 text-sm">
            <b>Alerta de Auditoria:</b> mais de 3 dias sem recontagem física do silo. Realize a auditoria do estoque agora.
          </div>
          <Btn variant="outline" onClick={() => updateBrand({ lastAuditDate: Date.now() })}>
            Marcar feita
          </Btn>
        </div>
      )}

      <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={DollarSign} label="Faturamento Bruto" hint="Prontos/entregues no período" value={BRL(faturamento)} accent />
        <StatCard
          icon={TrendingUp}
          label="Margem Líquida Est."
          hint="Descontando filamento + energia"
          value={`${(margem * 100).toFixed(1)}%`}
          color={margem > 0.4 ? "#10B981" : undefined}
        />
        <StatCard
          icon={Package}
          label="Pedidos no Período"
          hint={`Últimos ${range === 1 ? "24h" : `${range} dias`}`}
          value={String(filtered.length)}
        />
        <StatCard
          icon={Package}
          label="Em Produção"
          hint="Aguardando ou imprimindo"
          value={String(orders.filter((o) => o.status === "PRINTING" || o.status === "QUEUE").length)}
        />
      </div>

      <Card>
        <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
          <h3 className="font-display text-base font-bold tracking-tight text-white">Pedidos recentes</h3>
          <Btn onClick={() => setOpenQuick(true)}>
            <Plus className="h-4 w-4" /> Registrar Venda Rápida
          </Btn>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {filtered.slice(0, 6).map((o) => (
            <div
              key={o.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3 text-sm transition-colors hover:bg-white/[0.02] -mx-2 px-2 rounded-lg"
            >
              <div className="min-w-0">
                <div className="truncate font-medium text-white">{o.itemName}</div>
                <div className="truncate text-xs text-white/45">
                  {o.clientName} · {o.platformSource}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="tabular-nums font-semibold text-white">{BRL(o.priceCharged)}</div>
                <div className="text-[10px] uppercase tracking-wider text-white/40">{o.status}</div>
              </div>
            </div>
          ))}
          {!filtered.length && <div className="py-10 text-center text-sm text-white/40">Nenhum pedido no período.</div>}
        </div>
      </Card>

      <QuickSaleModal
        open={openQuick}
        onClose={() => setOpenQuick(false)}
        onSubmit={(form) => {
          addOrder({
            clientId: form.clientId,
            clientName: form.clientName,
            itemName: form.itemName,
            quantity: form.quantity,
            filamentType: form.filamentType,
            filamentColor: "—",
            weightGrams: form.weightGrams,
            printTimeHours: form.hours,
            priceCharged: form.price,
            createdAt: Date.now(),
            deadline: Date.now() + 3 * 86_400_000,
            platformSource: "MANUAL",
            status: "QUEUE",
            printingProgress: 0,
            paymentStatus: "PAGO",
            paymentMethod: "DINHEIRO",
          });
          setOpenQuick(false);
        }}
        clients={clients}
        catalog={catalog}
      />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent,
  color,
}: {
  icon: typeof DollarSign;
  label: string;
  value: string;
  hint: string;
  accent?: boolean;
  color?: string;
}) {
  return (
    <Card className="!p-6">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">{label}</span>
        <span
          className="grid h-8 w-8 place-items-center rounded-xl"
          style={{
            background: accent ? "var(--brand-primary-soft)" : "rgba(255,255,255,0.04)",
            border: "1px solid var(--hairline)",
          }}
        >
          <Icon className="h-3.5 w-3.5" style={{ color: accent ? "var(--brand-primary)" : "rgba(255,255,255,0.6)" }} />
        </span>
      </div>
      <div
        className="font-display mt-4 text-[34px] font-black leading-none tracking-tight tabular-nums"
        style={{ color: color ?? (accent ? "var(--brand-primary)" : "#fff") }}
      >
        {value}
      </div>
      <div className="mt-2 text-xs text-white/40">{hint}</div>
    </Card>
  );
}

function QuickSaleModal({
  open,
  onClose,
  onSubmit,
  clients,
  catalog,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (f: { clientId: number | null; clientName: string; itemName: string; quantity: number; filamentType: string; weightGrams: number; hours: number; price: number }) => void;
  clients: { id: number; name: string }[];
  catalog: { id: number; name: string; defaultPrice: number; weightGrams: number; printTimeHours: number; filamentType: string }[];
}) {
  const [clientId, setClientId] = useState<number | "">("");
  const [itemId, setItemId] = useState<number | "">("");
  const [qty, setQty] = useState(1);
  const item = catalog.find((c) => c.id === itemId);
  const client = clients.find((c) => c.id === clientId);
  const price = item ? item.defaultPrice * qty : 0;

  return (
    <Modal open={open} onClose={onClose} title="Registrar Venda Rápida">
      <div className="space-y-3">
        <Field label="Cliente">
          <Select value={clientId} onChange={(e) => setClientId(e.target.value ? Number(e.target.value) : "")}>
            <option value="">— Cliente avulso —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Item do catálogo">
          <Select value={itemId} onChange={(e) => setItemId(e.target.value ? Number(e.target.value) : "")}>
            <option value="">— Selecione —</option>
            {catalog.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} · {BRL(c.defaultPrice)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Quantidade">
          <Input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value)))} />
        </Field>
        <div className="rounded-2xl border border-white/5 bg-black/30 p-3 text-sm text-white/70">
          Total estimado: <span className="text-lg font-bold text-white">{BRL(price)}</span>
        </div>
        <Btn
          disabled={!item}
          onClick={() =>
            item &&
            onSubmit({
              clientId: client?.id ?? null,
              clientName: client?.name ?? "Avulso",
              itemName: item.name,
              quantity: qty,
              filamentType: item.filamentType,
              weightGrams: item.weightGrams * qty,
              hours: item.printTimeHours * qty,
              price,
            })
          }
        >
          Confirmar Venda
        </Btn>
      </div>
    </Modal>
  );
}