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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Painel de Controle</h2>
        <div className="flex gap-1 rounded-full border border-white/10 bg-black/30 p-1">
          {([1, 7, 30] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                range === r ? "text-black" : "text-white/60"
              }`}
              style={range === r ? { background: "var(--brand-primary)" } : undefined}
            >
              {r === 1 ? "Hoje" : `${r} dias`}
            </button>
          ))}
        </div>
      </div>

      {auditAlert && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div className="flex-1 text-sm">
            <b>Alerta de Auditoria:</b> mais de 3 dias sem recontagem física do silo. Realize a auditoria do estoque agora.
          </div>
          <Btn variant="outline" onClick={() => updateBrand({ lastAuditDate: Date.now() })}>
            Marcar feita
          </Btn>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center justify-between text-white/50">
            <span className="text-xs uppercase tracking-wider">Faturamento Bruto</span>
            <DollarSign className="h-4 w-4" />
          </div>
          <div className="mt-3 text-3xl font-black text-white">{BRL(faturamento)}</div>
          <div className="mt-1 text-xs text-white/40">Pedidos prontos/entregues no período</div>
        </Card>
        <Card>
          <div className="flex items-center justify-between text-white/50">
            <span className="text-xs uppercase tracking-wider">Margem Líquida Est.</span>
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="mt-3 text-3xl font-black" style={{ color: margem > 0.4 ? "#10B981" : "var(--brand-primary)" }}>
            {(margem * 100).toFixed(1)}%
          </div>
          <div className="mt-1 text-xs text-white/40">Descontando filamento + energia</div>
        </Card>
        <Card>
          <div className="flex items-center justify-between text-white/50">
            <span className="text-xs uppercase tracking-wider">Pedidos no Período</span>
            <Package className="h-4 w-4" />
          </div>
          <div className="mt-3 text-3xl font-black text-white">{filtered.length}</div>
          <div className="mt-1 text-xs text-white/40">Criados nos últimos {range === 1 ? "24h" : `${range} dias`}</div>
        </Card>
        <Card>
          <div className="flex items-center justify-between text-white/50">
            <span className="text-xs uppercase tracking-wider">Pedidos em Produção</span>
            <Package className="h-4 w-4" />
          </div>
          <div className="mt-3 text-3xl font-black text-white">
            {orders.filter((o) => o.status === "PRINTING" || o.status === "QUEUE").length}
          </div>
          <div className="mt-1 text-xs text-white/40">Aguardando ou imprimindo</div>
        </Card>
      </div>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white/80">Pedidos recentes</h3>
          <Btn onClick={() => setOpenQuick(true)}>
            <Plus className="h-4 w-4" /> Registrar Venda Rápida
          </Btn>
        </div>
        <div className="divide-y divide-white/5">
          {filtered.slice(0, 6).map((o) => (
            <div key={o.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <div className="font-medium text-white">{o.itemName}</div>
                <div className="text-xs text-white/50">
                  {o.clientName} · {o.platformSource}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-white">{BRL(o.priceCharged)}</div>
                <div className="text-xs text-white/40">{o.status}</div>
              </div>
            </div>
          ))}
          {!filtered.length && <div className="py-6 text-center text-sm text-white/40">Nenhum pedido no período.</div>}
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