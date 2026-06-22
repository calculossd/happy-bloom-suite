import { useState } from "react";
import { MessageCircle, Plus, Search, Trash2, History } from "lucide-react";
import { Btn, Card, Field, Input, Modal, Textarea } from "../primitives";
import { useClients, useOrders } from "@/lib/g3d/store";
import { BRL, isEmail, maskPhone, whatsappLink } from "@/lib/g3d/utils";
import type { Client } from "@/lib/g3d/types";

export function ClientesTab() {
  const { clients, addClient, removeClient, updateClient } = useClients();
  const { orders } = useOrders();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<Client | null>(null);
  const [confirmDel, setConfirmDel] = useState<number | null>(null);

  const filtered = clients.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-white">Clientes & CRM</h2>
        <Btn onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Cadastrar Cliente</Btn>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar cliente..." className="pl-9" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((c) => {
          const last = orders.filter((o) => o.clientId === c.id);
          const lastOrder = last.sort((a, b) => b.createdAt - a.createdAt)[0];
          return (
            <Card key={c.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-bold text-white">{c.name}</div>
                  <div className="truncate text-xs text-white/50">{c.phone} · {c.email}</div>
                  <div className="truncate text-xs text-white/40">{c.address}</div>
                </div>
                <div className="text-right text-xs text-white/50">
                  <div>{c.stockCount ?? last.length} pedidos</div>
                  <div className="font-semibold text-white">{BRL(c.stockValue ?? last.reduce((s, o) => s + o.priceCharged, 0))}</div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-4 py-2.5 text-sm font-medium text-emerald-300 hover:bg-emerald-500/25"
                  href={lastOrder ? whatsappLink(c.phone, c.name, lastOrder) : `https://api.whatsapp.com/send?phone=55${c.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => updateClient(c.id, { lastContactDate: Date.now() })}
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
                <Btn variant="outline" onClick={() => setHistory(c)}>
                  <History className="h-4 w-4" /> Histórico
                </Btn>
                {confirmDel === c.id ? (
                  <Btn variant="danger" onClick={() => { removeClient(c.id); setConfirmDel(null); }}>
                    Confirmar Exclusão
                  </Btn>
                ) : (
                  <Btn variant="ghost" onClick={() => setConfirmDel(c.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Btn>
                )}
              </div>
            </Card>
          );
        })}
        {!filtered.length && <Card className="text-center text-sm text-white/40">Nenhum cliente encontrado.</Card>}
      </div>

      <NewClientModal open={open} onClose={() => setOpen(false)} onSubmit={(c) => { addClient(c); setOpen(false); }} />

      <Modal open={!!history} onClose={() => setHistory(null)} title={`Histórico — ${history?.name ?? ""}`}>
        {history && (() => {
          const list = orders.filter((o) => o.clientId === history.id);
          const total = list.reduce((s, o) => s + o.priceCharged, 0);
          const ticket = list.length ? total / list.length : 0;
          return (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3 text-center">
                <Card className="!p-3"><div className="text-xs text-white/50">Pedidos</div><div className="text-lg font-bold text-white">{list.length}</div></Card>
                <Card className="!p-3"><div className="text-xs text-white/50">Total</div><div className="text-lg font-bold text-white">{BRL(total)}</div></Card>
                <Card className="!p-3"><div className="text-xs text-white/50">Ticket médio</div><div className="text-lg font-bold text-white">{BRL(ticket)}</div></Card>
              </div>
              <div className="divide-y divide-white/5">
                {list.map((o) => (
                  <div key={o.id} className="flex items-center justify-between py-2 text-sm">
                    <div>
                      <div className="text-white">{o.itemName}</div>
                      <div className="text-xs text-white/40">{new Date(o.createdAt).toLocaleDateString("pt-BR")} · {o.status}</div>
                    </div>
                    <div className="font-semibold text-white">{BRL(o.priceCharged)}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}

function NewClientModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (c: Omit<Client, "id">) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const valid = name.trim() && (!email || isEmail(email));
  return (
    <Modal open={open} onClose={onClose} title="Cadastrar novo cliente">
      <div className="space-y-3">
        <Field label="Nome completo *"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="WhatsApp"><Input value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} placeholder="(11) 99999-9999" /></Field>
        <Field label="E-mail"><Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="exemplo@email.com" /></Field>
        <Field label="Endereço de despacho"><Input value={address} onChange={(e) => setAddress(e.target.value)} /></Field>
        <Field label="Observações"><Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} /></Field>
        <Btn disabled={!valid} onClick={() => onSubmit({ name: name.trim(), phone, email, address, note })}>
          Salvar cliente
        </Btn>
      </div>
    </Modal>
  );
}