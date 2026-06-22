import { useState } from "react";
import { Play, Pause, Square, Trash2, Plus, Camera, Printer as PrinterIcon } from "lucide-react";
import { Card, Btn, Modal, Field, Input, Select, Pill } from "../primitives";
import { useOrders, usePrinters } from "@/lib/g3d/store";
import type { Printer } from "@/lib/g3d/types";

export function ProducaoTab() {
  const { orders, addOrder, updateOrder, removeOrder } = useOrders();
  const { printers, addPrinter, updatePrinter } = usePrinters();
  const [openJob, setOpenJob] = useState(false);
  const [openPrinter, setOpenPrinter] = useState(false);
  const [camera, setCamera] = useState<string | null>(null);

  const jobs = orders.filter((o) => o.status !== "DELIVERED");

  const cleanupOld = () => {
    const cutoff = Date.now() - 15 * 86_400_000;
    orders
      .filter((o) => o.status === "DELIVERED" && o.createdAt < cutoff)
      .forEach((o) => removeOrder(o.id));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-white">Produção & PrintFlow</h2>
        <div className="flex flex-wrap gap-2">
          <Btn onClick={() => setOpenJob(true)}>
            <Plus className="h-4 w-4" /> Novo Trabalho
          </Btn>
          <Btn variant="outline" onClick={() => setOpenPrinter(true)}>
            <PrinterIcon className="h-4 w-4" /> Adicionar Máquina
          </Btn>
          <Btn variant="ghost" onClick={cleanupOld}>
            Limpar &gt;15 dias
          </Btn>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {printers.map((p) => (
          <Card key={p.id}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">{p.name}</div>
                <div className="text-xs text-white/40">{p.model} · {p.ipAddress}</div>
              </div>
              <Pill tone={p.status === "PRINTING" ? "green" : p.status === "MAINTENANCE" ? "amber" : "muted"}>
                {p.status}
              </Pill>
            </div>
            {p.currentJob && (
              <div className="mt-3 text-xs text-white/60">Job atual: <b className="text-white">{p.currentJob}</b></div>
            )}
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full transition-all"
                style={{ width: `${p.printProgress ?? 0}%`, background: "var(--brand-primary)" }}
              />
            </div>
            <div className="mt-3 flex gap-2">
              {p.cameraUrl && (
                <Btn variant="outline" onClick={() => setCamera(p.cameraUrl!)}>
                  <Camera className="h-4 w-4" /> Câmera
                </Btn>
              )}
              <Btn
                variant="ghost"
                onClick={() =>
                  updatePrinter(p.id, {
                    status: p.status === "MAINTENANCE" ? "IDLE" : "MAINTENANCE",
                  })
                }
              >
                {p.status === "MAINTENANCE" ? "Liberar" : "Manutenção"}
              </Btn>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="mb-3 text-sm font-semibold text-white/80">Fila de Jobs</h3>
        <div className="space-y-2">
          {jobs.map((o) => {
            const printer = printers.find((p) => p.id === o.assignedPrinterId);
            return (
              <div key={o.id} className="rounded-2xl border border-white/5 bg-black/30 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-white">{o.itemName}</div>
                    <div className="text-xs text-white/40">
                      {o.clientName} · {o.weightGrams}g · {o.printTimeHours}h · {o.filamentType}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Pill tone={o.status === "PRINTING" ? "green" : o.status === "READY" ? "blue" : "muted"}>
                      {o.status}
                    </Pill>
                    <Btn
                      variant="ghost"
                      onClick={() => {
                        if (!printer) return;
                        updateOrder(o.id, { status: "PRINTING", printingProgress: 1 });
                        updatePrinter(printer.id, { status: "PRINTING", currentJob: o.itemName });
                      }}
                    >
                      <Play className="h-4 w-4" />
                    </Btn>
                    <Btn variant="ghost" onClick={() => updateOrder(o.id, { status: "QUEUE" })}>
                      <Pause className="h-4 w-4" />
                    </Btn>
                    <Btn variant="ghost" onClick={() => updateOrder(o.id, { status: "READY", printingProgress: 100 })}>
                      <Square className="h-4 w-4" />
                    </Btn>
                    <Btn variant="danger" onClick={() => removeOrder(o.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Btn>
                  </div>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full"
                    style={{ width: `${o.printingProgress}%`, background: "var(--brand-primary)" }}
                  />
                </div>
              </div>
            );
          })}
          {!jobs.length && <div className="py-6 text-center text-sm text-white/40">Nenhum job ativo.</div>}
        </div>
      </Card>

      <NewJobModal
        open={openJob}
        onClose={() => setOpenJob(false)}
        printers={printers}
        onSubmit={(j) => {
          addOrder({
            clientName: "Sem cliente",
            itemName: j.file,
            quantity: 1,
            filamentType: "PLA",
            filamentColor: "—",
            weightGrams: j.grams,
            printTimeHours: j.hours + j.minutes / 60,
            priceCharged: 0,
            createdAt: Date.now(),
            deadline: Date.now() + 3 * 86_400_000,
            platformSource: "MANUAL",
            status: "QUEUE",
            printingProgress: 0,
            assignedPrinterId: j.printerId,
            printerName: printers.find((p) => p.id === j.printerId)?.name,
          });
          setOpenJob(false);
        }}
      />

      <NewPrinterModal
        open={openPrinter}
        onClose={() => setOpenPrinter(false)}
        onSubmit={(p) => {
          addPrinter(p);
          setOpenPrinter(false);
        }}
      />

      <Modal open={!!camera} onClose={() => setCamera(null)} title="Câmera de impressão">
        <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
          {camera && <iframe src={camera} className="h-full w-full" title="camera" />}
        </div>
      </Modal>
    </div>
  );
}

function NewJobModal({
  open,
  onClose,
  printers,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  printers: Printer[];
  onSubmit: (f: { file: string; hours: number; minutes: number; grams: number; printerId: number | null }) => void;
}) {
  const [file, setFile] = useState("");
  const [hours, setHours] = useState(2);
  const [minutes, setMinutes] = useState(0);
  const [grams, setGrams] = useState(50);
  const [printerId, setPrinterId] = useState<number | "">("");
  return (
    <Modal open={open} onClose={onClose} title="Novo Trabalho (GCODE)">
      <div className="space-y-3">
        <Field label="Arquivo (.gcode / .3mf)">
          <Input value={file} onChange={(e) => setFile(e.target.value)} placeholder="vaso_hex.gcode" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Horas"><Input type="number" min={0} value={hours} onChange={(e) => setHours(Number(e.target.value))} /></Field>
          <Field label="Minutos"><Input type="number" min={0} max={59} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} /></Field>
        </div>
        <Field label="Peso neto (g)"><Input type="number" min={0} value={grams} onChange={(e) => setGrams(Number(e.target.value))} /></Field>
        <Field label="Máquina alocada">
          <Select value={printerId} onChange={(e) => setPrinterId(e.target.value ? Number(e.target.value) : "")}>
            <option value="">— Selecione —</option>
            {printers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
        </Field>
        <Btn disabled={!file} onClick={() => onSubmit({ file, hours, minutes, grams, printerId: printerId === "" ? null : Number(printerId) })}>
          Adicionar à fila
        </Btn>
      </div>
    </Modal>
  );
}

function NewPrinterModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (p: Omit<Printer, "id">) => void;
}) {
  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [apiType, setApiType] = useState<Printer["apiType"]>("OCTOPRINT");
  const [ip, setIp] = useState("");
  const [watts, setWatts] = useState(120);
  const [cam, setCam] = useState("");
  return (
    <Modal open={open} onClose={onClose} title="Adicionar Máquina">
      <div className="space-y-3">
        <Field label="Nome"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Prusa MK4" /></Field>
        <Field label="Modelo"><Input value={model} onChange={(e) => setModel(e.target.value)} /></Field>
        <Field label="Tipo de Interface">
          <Select value={apiType} onChange={(e) => setApiType(e.target.value as Printer["apiType"])}>
            <option value="OCTOPRINT">OctoPrint</option>
            <option value="KLIPPER">Klipper / Fluidd</option>
            <option value="BAMBU_CLOUD">Bambu Cloud</option>
            <option value="NONE">Sem interface</option>
          </Select>
        </Field>
        <Field label="IP Address"><Input value={ip} onChange={(e) => setIp(e.target.value)} placeholder="192.168.0.21" /></Field>
        <Field label="Watts/hora do bico"><Input type="number" value={watts} onChange={(e) => setWatts(Number(e.target.value))} /></Field>
        <Field label="Câmera Stream URL"><Input value={cam} onChange={(e) => setCam(e.target.value)} /></Field>
        <Btn disabled={!name} onClick={() => onSubmit({ name, model, status: "IDLE", ipAddress: ip, apiType, wattsPerHour: watts, cameraUrl: cam })}>
          Salvar máquina
        </Btn>
      </div>
    </Modal>
  );
}