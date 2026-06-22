import { useMemo, useState } from "react";
import { Plus, Calculator, Trash2, Combine } from "lucide-react";
import { Btn, Card, Field, Input, Modal, Pill, Select } from "../primitives";
import { useConsumables, useFilaments } from "@/lib/g3d/store";
import { BRL, calcEmenda } from "@/lib/g3d/utils";
import { calcularPreco } from "@/lib/g3d/pricing";
import type { FilamentStock } from "@/lib/g3d/types";

export function CustosTab() {
  const { filaments, addFilament, removeFilament } = useFilaments();
  const { consumables, addConsumable, removeConsumable } = useConsumables();
  const [openF, setOpenF] = useState(false);
  const [openC, setOpenC] = useState(false);
  const [openE, setOpenE] = useState(false);

  const [inp, setInp] = useState({
    pesoPecaGrams: 100,
    taxaPerdaSuportesPercent: 8,
    custoRoloFilamentoBRL: 95,
    consumoWattsMaquina: 120,
    tempoImpressaoHoras: 4,
    custoKwhBRL: 0.92,
    valorMaquinaBRL: 4500,
    tempoVidaUtilHoras: 5000,
    totalAcumuladoInsumosFisicosUsadosBRL: 3,
    tempoAcabamentoPosProcessamentoHoras: 0.25,
    valorSuaHoraTrabalhoBRL: 35,
    margemLucroDesejadoPercent: 80,
    tarifaFixaMarketplaceBRL: 6,
    comissaoMarketplacePercent: 14,
  });

  const r = useMemo(() => calcularPreco(inp), [inp]);
  const num = (k: keyof typeof inp) => (
    <Input
      type="number"
      value={inp[k]}
      step="0.01"
      onChange={(e) => setInp({ ...inp, [k]: Number(e.target.value) })}
    />
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-white">Custos, Filamentos & Insumos</h2>
        <div className="flex flex-wrap gap-2">
          <Btn onClick={() => setOpenF(true)}><Plus className="h-4 w-4" /> Novo Filamento</Btn>
          <Btn variant="outline" onClick={() => setOpenE(true)}><Combine className="h-4 w-4" /> Emenda de Bobina</Btn>
          <Btn variant="outline" onClick={() => setOpenC(true)}><Plus className="h-4 w-4" /> Add Insumo</Btn>
        </div>
      </div>

      <Card>
        <div className="mb-3 flex items-center gap-2">
          <Calculator className="h-4 w-4 text-[var(--brand-primary)]" />
          <h3 className="text-sm font-semibold text-white/80">Fórmula Mestra de Precificação 3D</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Peso da peça (g)">{num("pesoPecaGrams")}</Field>
          <Field label="Perda/suportes %">{num("taxaPerdaSuportesPercent")}</Field>
          <Field label="Custo rolo 1kg (R$)">{num("custoRoloFilamentoBRL")}</Field>
          <Field label="Watts máquina">{num("consumoWattsMaquina")}</Field>
          <Field label="Tempo impressão (h)">{num("tempoImpressaoHoras")}</Field>
          <Field label="kWh (R$)">{num("custoKwhBRL")}</Field>
          <Field label="Valor máquina (R$)">{num("valorMaquinaBRL")}</Field>
          <Field label="Vida útil máquina (h)">{num("tempoVidaUtilHoras")}</Field>
          <Field label="Insumos físicos (R$)">{num("totalAcumuladoInsumosFisicosUsadosBRL")}</Field>
          <Field label="Pós-processo (h)">{num("tempoAcabamentoPosProcessamentoHoras")}</Field>
          <Field label="Sua hora (R$)">{num("valorSuaHoraTrabalhoBRL")}</Field>
          <Field label="Margem lucro %">{num("margemLucroDesejadoPercent")}</Field>
          <Field label="Tarifa fixa marketplace (R$)">{num("tarifaFixaMarketplaceBRL")}</Field>
          <Field label="Comissão marketplace %">{num("comissaoMarketplacePercent")}</Field>
        </div>
        <div className="mt-5 grid gap-3 rounded-2xl border border-white/5 bg-black/30 p-4 sm:grid-cols-3 text-sm">
          <Stat label="Filamento" v={r.custoFilamento} />
          <Stat label="Energia" v={r.custoEnergia} />
          <Stat label="Depreciação" v={r.depreciacaoMaquina} />
          <Stat label="Insumos" v={r.custoInsumosEmbalagem} />
          <Stat label="Mão de obra" v={r.custoMaoDeObra} />
          <Stat label="Custo Produção" v={r.custoProducaoTotal} highlight />
        </div>
        <div className="mt-3 rounded-2xl p-5 text-center" style={{ background: "var(--brand-primary)" }}>
          <div className="text-xs uppercase tracking-wider text-black/70">Preço de Venda Final</div>
          <div className="text-4xl font-black text-black">{BRL(r.precoVendaFinal)}</div>
          <div className="mt-1 text-xs text-black/60">parcial sem marketplace: {BRL(r.precoVendaParcial)}</div>
        </div>
      </Card>

      <Card>
        <h3 className="mb-3 text-sm font-semibold text-white/80">Filamentos em estoque</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-white/40">
              <tr><th className="py-2">Tipo</th><th>Cor</th><th>Fornecedor</th><th className="text-right">Estoque</th><th className="text-right">Rolo</th><th></th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filaments.map((f) => (
                <tr key={f.id} className="text-white/80">
                  <td className="py-2">{f.type}</td>
                  <td>{f.color}</td>
                  <td className="text-white/50">{f.supplier ?? "—"}</td>
                  <td className="text-right">
                    <span className={f.stockGrams < f.minStockGrams ? "text-amber-400" : ""}>{f.stockGrams}g</span>
                  </td>
                  <td className="text-right">{BRL(f.priceRoll)}</td>
                  <td className="text-right"><Btn variant="ghost" onClick={() => removeFilament(f.id)}><Trash2 className="h-4 w-4" /></Btn></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h3 className="mb-3 text-sm font-semibold text-white/80">Insumos</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {consumables.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-black/30 p-3">
              <div>
                <div className="text-sm text-white">{c.name}</div>
                <div className="text-xs text-white/40">Estoque: {c.stock}</div>
              </div>
              <div className="flex items-center gap-2">
                <Pill>{BRL(c.unitCost)}</Pill>
                <Btn variant="ghost" onClick={() => removeConsumable(c.id)}><Trash2 className="h-4 w-4" /></Btn>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <NewFilamentModal open={openF} onClose={() => setOpenF(false)} onSubmit={(f) => { addFilament(f); setOpenF(false); }} />
      <NewConsumableModal open={openC} onClose={() => setOpenC(false)} onSubmit={(c) => { addConsumable(c); setOpenC(false); }} />
      <EmendaModal open={openE} onClose={() => setOpenE(false)} filaments={filaments} />
    </div>
  );
}

function Stat({ label, v, highlight }: { label: string; v: number; highlight?: boolean }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-white/40">{label}</div>
      <div className={`text-lg font-bold ${highlight ? "text-[var(--brand-primary)]" : "text-white"}`}>{BRL(v)}</div>
    </div>
  );
}

function NewFilamentModal({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (f: Omit<FilamentStock, "id">) => void }) {
  const [type, setType] = useState("PLA");
  const [color, setColor] = useState("");
  const [supplier, setSupplier] = useState("");
  const [priceRoll, setPriceRoll] = useState(95);
  const [stock, setStock] = useState(1000);
  const [min, setMin] = useState(300);
  return (
    <Modal open={open} onClose={onClose} title="Novo Rolo de Filamento">
      <div className="space-y-3">
        <Field label="Tipo de polímero">
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            {["PLA", "ABS", "PETG", "TPU", "Nylon", "ASA"].map((t) => <option key={t}>{t}</option>)}
          </Select>
        </Field>
        <Field label="Cor"><Input value={color} onChange={(e) => setColor(e.target.value)} /></Field>
        <Field label="Fornecedor"><Input value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="3D Fila, Sunlu..." /></Field>
        <Field label="Custo por bobina (R$)"><Input type="number" value={priceRoll} onChange={(e) => setPriceRoll(Number(e.target.value))} /></Field>
        <Field label="Estoque atual (g)"><Input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} /></Field>
        <Field label="Mínimo (g)"><Input type="number" value={min} onChange={(e) => setMin(Number(e.target.value))} /></Field>
        <Btn disabled={!color} onClick={() => onSubmit({ type, color, supplier, priceRoll, stockGrams: stock, minStockGrams: min })}>Adicionar</Btn>
      </div>
    </Modal>
  );
}

function NewConsumableModal({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (c: { name: string; unitCost: number; stock: number }) => void }) {
  const [name, setName] = useState("");
  const [unitCost, setCost] = useState(10);
  const [stock, setStock] = useState(1);
  return (
    <Modal open={open} onClose={onClose} title="Adicionar Insumo">
      <div className="space-y-3">
        <Field label="Nome"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Fita Kapton, Spray..." /></Field>
        <Field label="Custo unitário (R$)"><Input type="number" value={unitCost} onChange={(e) => setCost(Number(e.target.value))} /></Field>
        <Field label="Estoque"><Input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} /></Field>
        <Btn disabled={!name} onClick={() => onSubmit({ name, unitCost, stock })}>Adicionar</Btn>
      </div>
    </Modal>
  );
}

function EmendaModal({ open, onClose, filaments }: { open: boolean; onClose: () => void; filaments: FilamentStock[] }) {
  const [type, setType] = useState("PLA");
  const [target, setTarget] = useState(300);
  const result = calcEmenda(filaments, type, target);
  return (
    <Modal open={open} onClose={onClose} title="Bobina Killer — Emenda">
      <div className="space-y-3">
        <Field label="Tipo do filamento">
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            {Array.from(new Set(filaments.map((f) => f.type))).map((t) => <option key={t}>{t}</option>)}
          </Select>
        </Field>
        <Field label="Gramas necessárias"><Input type="number" value={target} onChange={(e) => setTarget(Number(e.target.value))} /></Field>
        <div className={`rounded-2xl border p-4 text-sm ${result.feasible ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border-amber-500/30 bg-amber-500/10 text-amber-200"}`}>
          {result.feasible ? "Job possível combinando os rolos abaixo:" : `Faltam ${result.remaining}g — adicione rolos novos.`}
          <ul className="mt-2 space-y-1">
            {result.used.map((u) => (
              <li key={u.id}>• {u.color}: usar {u.grams}g</li>
            ))}
          </ul>
        </div>
      </div>
    </Modal>
  );
}