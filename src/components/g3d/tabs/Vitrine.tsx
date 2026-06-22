import { useState } from "react";
import { Plus, Search, Eye, Download, Trash2 } from "lucide-react";
import { Btn, Card, Field, Input, Modal, Textarea } from "../primitives";
import { useCatalog, useOrders } from "@/lib/g3d/store";
import { BRL, downloadCSV, toCSV } from "@/lib/g3d/utils";
import type { CatalogItem } from "@/lib/g3d/types";

export function VitrineTab({ onShowcase }: { onShowcase: () => void }) {
  const { catalog, addItem, removeItem } = useCatalog();
  const { orders } = useOrders();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const filtered = orders.filter(
    (o) =>
      o.clientName.toLowerCase().includes(q.toLowerCase()) ||
      o.itemName.toLowerCase().includes(q.toLowerCase()),
  );

  const exportCSV = () => {
    const rows = orders.map((o) => ({
      id: o.id,
      cliente: o.clientName,
      item: o.itemName,
      qtd: o.quantity,
      preco: o.priceCharged,
      status: o.status,
      plataforma: o.platformSource,
      data: new Date(o.createdAt).toLocaleString("pt-BR"),
    }));
    downloadCSV(`gestao3d_vendas_${Date.now()}.csv`, toCSV(rows));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-white">Vitrine & Histórico</h2>
        <div className="flex flex-wrap gap-2">
          <Btn onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Novo Produto</Btn>
          <Btn variant="outline" onClick={onShowcase}><Eye className="h-4 w-4" /> Vitrine Pública</Btn>
          <Btn variant="ghost" onClick={exportCSV}><Download className="h-4 w-4" /> Exportar CSV</Btn>
        </div>
      </div>

      <Card>
        <h3 className="mb-3 text-sm font-semibold text-white/80">Catálogo</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {catalog.map((c) => (
            <div key={c.id} className="rounded-2xl border border-white/5 bg-black/30 p-4">
              {c.imageUrl && <img src={c.imageUrl} alt={c.name} className="mb-3 aspect-square w-full rounded-xl object-cover" />}
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-white">{c.name}</div>
                  <div className="text-xs text-white/40">SKU {c.productCode} · {c.weightGrams}g · {c.printTimeHours}h</div>
                </div>
                <Btn variant="ghost" onClick={() => removeItem(c.id)}><Trash2 className="h-4 w-4" /></Btn>
              </div>
              <div className="mt-3 text-xl font-black text-[var(--brand-primary)]">{BRL(c.defaultPrice)}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white/80">Histórico de Vendas</h3>
        </div>
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por cliente ou item..." className="pl-9" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-white/40">
              <tr><th className="py-2">Data</th><th>Cliente</th><th>Item</th><th>Plataforma</th><th className="text-right">Total</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((o) => (
                <tr key={o.id} className="text-white/80">
                  <td className="py-2">{new Date(o.createdAt).toLocaleDateString("pt-BR")}</td>
                  <td>{o.clientName}</td>
                  <td>{o.itemName}</td>
                  <td className="text-white/50">{o.platformSource}</td>
                  <td className="text-right font-semibold text-white">{BRL(o.priceCharged)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <NewProductModal open={open} onClose={() => setOpen(false)} onSubmit={(c) => { addItem(c); setOpen(false); }} />
    </div>
  );
}

function NewProductModal({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (c: Omit<CatalogItem, "id">) => void }) {
  const [name, setName] = useState("");
  const [productCode, setSku] = useState("");
  const [weightGrams, setW] = useState(100);
  const [printTimeHours, setH] = useState(3);
  const [filamentType, setFt] = useState("PLA");
  const [defaultPrice, setP] = useState(50);
  const [description, setDesc] = useState("");
  const [imageUrl, setImg] = useState("");
  return (
    <Modal open={open} onClose={onClose} title="Novo Produto para Catálogo">
      <div className="space-y-3">
        <Field label="Nome"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="SKU / Código"><Input value={productCode} onChange={(e) => setSku(e.target.value)} /></Field>
        <Field label="URL da foto"><Input value={imageUrl} onChange={(e) => setImg(e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Peso (g)"><Input type="number" value={weightGrams} onChange={(e) => setW(Number(e.target.value))} /></Field>
          <Field label="Tempo (h)"><Input type="number" value={printTimeHours} onChange={(e) => setH(Number(e.target.value))} /></Field>
        </div>
        <Field label="Filamento"><Input value={filamentType} onChange={(e) => setFt(e.target.value)} /></Field>
        <Field label="Preço calibrado"><Input type="number" value={defaultPrice} onChange={(e) => setP(Number(e.target.value))} /></Field>
        <Field label="Descrição"><Textarea value={description} onChange={(e) => setDesc(e.target.value)} rows={3} /></Field>
        <Btn disabled={!name} onClick={() => onSubmit({ name, productCode, weightGrams, printTimeHours, filamentType, defaultPrice, description, imageUrl })}>
          Adicionar ao catálogo
        </Btn>
      </div>
    </Modal>
  );
}

export function ShowcaseView({ onExit }: { onExit: () => void }) {
  const { catalog } = useCatalog();
  return (
    <div className="min-h-screen p-6" style={{ background: "var(--brand-bg)" }}>
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-black text-white">Catálogo</h1>
          <Btn variant="outline" onClick={onExit}>← Voltar ao painel</Btn>
        </header>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {catalog.map((c) => (
            <div key={c.id} className="overflow-hidden rounded-3xl border border-white/5" style={{ background: "var(--brand-card)" }}>
              {c.imageUrl ? (
                <img src={c.imageUrl} alt={c.name} className="aspect-square w-full object-cover" />
              ) : (
                <div className="grid aspect-square place-items-center text-6xl" style={{ background: "var(--brand-primary)", color: "#000" }}>
                  {c.name[0]}
                </div>
              )}
              <div className="p-5">
                <div className="text-lg font-bold text-white">{c.name}</div>
                <div className="mt-1 text-xs text-white/50">{c.description}</div>
                <div className="mt-3 text-2xl font-black text-[var(--brand-primary)]">{BRL(c.defaultPrice)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}