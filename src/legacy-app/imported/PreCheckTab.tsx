import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  ClipboardCheck, Check, ChevronRight, Send, Terminal, Wrench, Layers, Thermometer,
  Move, Flame, Filter, Camera, Calculator, RotateCcw, History, Youtube, SkipForward,
  Save, Settings2, Printer as PrinterIcon,
} from "lucide-react";
import { listPrinters, type Printer } from "@/lib/printers-db";
import { sendGcode } from "@/lib/octoprint";
import {
  getProfile, saveProfile, listRuns, pushRun, loadProgress, saveProgress,
  type CalibrationProfile,
} from "@/lib/calibration-db";

export const Route = createFileRoute("/calibracao")({
  head: () => ({ meta: [{ title: "Calibração — ImpreMetrics 3D" }] }),
  component: CalibrationPage,
});

type Step = {
  id: string;
  title: string;
  desc: string;
  icon: any;
  tasks: { id: string; label: string; tip?: string }[];
  video?: string;
};

const STEPS: Step[] = [
  {
    id: "physical", title: "A. Preparação física", icon: Wrench,
    desc: "Estrutura, correias, roletes, lubrificação.",
    tasks: [
      { id: "screws", label: "Parafusos do frame apertados" },
      { id: "belts", label: "Tensão das correias X e Y conferida" },
      { id: "wheels", label: "Rodas POM sem folga e trilhos limpos" },
      { id: "zlube", label: "Eixos Z lubrificados" },
      { id: "wires", label: "Cabos e conexões inspecionados" },
    ],
    video: "https://www.youtube.com/embed/Ye-vno6IbqI",
  },
  {
    id: "bed", title: "B. Nivelamento da mesa", icon: Layers,
    desc: "Manual com papel ou auto-level (BLTouch/CRTouch).",
    tasks: [
      { id: "preheat", label: "Mesa e bico pré-aquecidos (60°C / 200°C PLA)" },
      { id: "corners", label: "4 cantos + centro nivelados com papel" },
      { id: "zoffset", label: "Z-offset salvo (se auto-level)" },
      { id: "firstlayer", label: "Teste de primeira camada aprovado" },
    ],
    video: "https://www.youtube.com/embed/98UFkSnXOPo",
  },
  {
    id: "esteps", title: "C. E-steps do extrusor", icon: Calculator,
    desc: "Marque 120mm, extruda 100mm, calcule e salve.",
    tasks: [
      { id: "marked", label: "Filamento marcado a 120mm" },
      { id: "extruded", label: "Extrudados 100mm (M83 + G1 E100 F100)" },
      { id: "measured", label: "Medida a sobra com paquímetro" },
      { id: "saved", label: "Novo valor enviado (M92) e salvo (M500)" },
    ],
    video: "https://www.youtube.com/embed/YUPfBJz3I6Y",
  },
  {
    id: "pid", title: "D. PID Tuning", icon: Thermometer,
    desc: "Bico (M303 E0) e mesa (M303 E-1). Salvar com M301/M304 + M500.",
    tasks: [
      { id: "hotend", label: "PID do bico calibrado e salvo" },
      { id: "bed", label: "PID da mesa calibrado e salvo" },
    ],
  },
  {
    id: "retraction", title: "E. Retração", icon: Filter,
    desc: "Torre de retração. Direct: 0.5–2mm. Bowden: 4–7mm.",
    tasks: [
      { id: "printed", label: "Torre impressa" },
      { id: "stringing", label: "Stringing avaliado" },
      { id: "values", label: "Valores ideais registrados" },
    ],
  },
  {
    id: "flow", title: "F. Flow (multiplicador)", icon: Calculator,
    desc: "Cubo 20×20mm parede simples. Esperado: largura de bico.",
    tasks: [
      { id: "cube", label: "Cubo impresso e medido" },
      { id: "flow", label: "Novo flow calculado e salvo no slicer" },
    ],
  },
  {
    id: "temp", title: "G. Torre de temperatura", icon: Flame,
    desc: "Por filamento. Use plugin do slicer.",
    tasks: [
      { id: "tower", label: "Torre impressa para o filamento atual" },
      { id: "best", label: "Melhor temperatura anotada" },
    ],
  },
  {
    id: "endstops", title: "H. Endstops & Homing", icon: Move,
    desc: "Movimentação manual e G28.",
    tasks: [
      { id: "home", label: "G28 executado sem erros" },
      { id: "moves", label: "Movimentos X/Y/Z testados" },
    ],
  },
  {
    id: "filsensor", title: "I. Sensor de filamento", icon: Settings2,
    desc: "Opcional. M412 ativa/desativa.",
    tasks: [
      { id: "tested", label: "Sensor testado" },
    ],
  },
  {
    id: "camera", title: "J. Câmera & conectividade", icon: Camera,
    desc: "Stream e Wi-Fi.",
    tasks: [
      { id: "stream", label: "Stream da câmera funcionando" },
      { id: "wifi", label: "Conexão estável" },
    ],
  },
];

function CalibrationPage() {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [printerId, setPrinterId] = useState<string>("");
  const [profile, setProfile] = useState<CalibrationProfile | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [openStep, setOpenStep] = useState<string>("physical");
  const [log, setLog] = useState<{ t: number; text: string; ok?: boolean }[]>([]);
  const [cmd, setCmd] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  // E-steps calculator
  const [eCurrent, setECurrent] = useState("93");
  const [eRemain, setERemain] = useState("");
  // Flow calculator
  const [flowExp, setFlowExp] = useState("0.42");
  const [flowMeas, setFlowMeas] = useState("");
  const [flowCur, setFlowCur] = useState("100");
  // PID inputs
  const [pidTemp, setPidTemp] = useState("200");
  const [bedTemp, setBedTemp] = useState("60");

  useEffect(() => {
    const ps = listPrinters();
    setPrinters(ps);
    if (ps[0]) setPrinterId(ps[0].id);
  }, []);

  useEffect(() => {
    if (!printerId) return;
    setProfile(getProfile(printerId));
    setChecked(loadProgress(printerId));
  }, [printerId]);

  useEffect(() => {
    if (printerId) saveProgress(printerId, checked);
  }, [printerId, checked]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: 999999 });
  }, [log]);

  const printer = printers.find((p) => p.id === printerId);
  const totalTasks = STEPS.reduce((n, s) => n + s.tasks.length, 0);
  const doneTasks = useMemo(
    () => STEPS.flatMap((s) => s.tasks).filter((t) => checked[t.id]).length,
    [checked],
  );
  const skipped = profile?.skipped ?? [];
  const pct = Math.round((doneTasks / totalTasks) * 100);

  const toggle = (id: string) => setChecked((c) => ({ ...c, [id]: !c[id] }));

  const stepDone = (s: Step) => {
    if (skipped.includes(s.id)) return true;
    return s.tasks.every((t) => checked[t.id]);
  };

  const toggleSkip = (sid: string) => {
    if (!profile) return;
    const newSkipped = skipped.includes(sid) ? skipped.filter((x) => x !== sid) : [...skipped, sid];
    const np = { ...profile, skipped: newSkipped };
    setProfile(np); saveProfile(np);
  };

  const pushLog = (text: string, ok?: boolean) =>
    setLog((l) => [...l, { t: Date.now(), text, ok }].slice(-150));

  const send = async (g: string | string[]) => {
    if (!printer) { pushLog("Selecione uma impressora", false); return; }
    pushLog(`> ${Array.isArray(g) ? g.join("; ") : g}`);
    const r = await sendGcode(printer, g);
    pushLog(r.message, r.ok);
  };

  const finish = () => {
    if (!printer) return;
    const changes: Record<string, any> = {};
    if (profile?.esteps) changes.esteps = profile.esteps;
    if (profile?.flow) changes.flow = profile.flow;
    if (profile?.hotendPID) changes.hotendPID = profile.hotendPID;
    if (profile?.bedPID) changes.bedPID = profile.bedPID;
    pushRun({
      id: crypto.randomUUID(),
      printerId: printer.id,
      printerName: printer.name,
      completedSteps: STEPS.filter(stepDone).map((s) => s.id),
      changes,
      at: Date.now(),
    });
    alert(`✅ ${printer.name} calibrada — ${doneTasks}/${totalTasks} checks. Relatório salvo.`);
  };

  const reset = () => { if (confirm("Resetar progresso?")) setChecked({}); };

  // calculator results
  const newEsteps = (() => {
    const cur = parseFloat(eCurrent), rem = parseFloat(eRemain);
    if (!cur || !rem) return null;
    return (100 / (120 - rem)) * cur;
  })();
  const newFlow = (() => {
    const e = parseFloat(flowExp), m = parseFloat(flowMeas), c = parseFloat(flowCur);
    if (!e || !m || !c) return null;
    return (e / m) * c;
  })();

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-6 pt-20 pb-12">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white/40">
              <ClipboardCheck className="h-3.5 w-3.5" /> Calibração da Impressora
            </div>
            <h1 className="mt-1 text-3xl font-bold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>
              {printer ? `Calibrando: ${printer.name}` : "Calibração Completa"}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={printerId}
              onChange={(e) => setPrinterId(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            >
              <option value="" className="bg-[#0b0b14]">— escolher impressora —</option>
              {printers.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#0b0b14]">{p.name}</option>
              ))}
            </select>
            <button onClick={() => setShowHistory((v) => !v)} className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10">
              <History className="h-4 w-4" /> Histórico
            </button>
            <button onClick={reset} className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10">
              <RotateCcw className="h-4 w-4" /> Resetar
            </button>
          </div>
        </div>

        {printers.length === 0 && (
          <div className="mb-6 rounded-xl border border-amber-400/30 bg-amber-500/5 p-4 text-sm text-amber-200">
            Nenhuma impressora cadastrada.{" "}
            <Link to="/impressoras" className="underline">Cadastrar agora</Link> para enviar G-code direto pelo app.
          </div>
        )}

        {/* Progress */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between text-sm text-white/80">
            <span>{doneTasks} de {totalTasks} checks</span>
            <span className="font-mono text-cyan-300">{pct}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
          {pct === 100 && (
            <button onClick={finish} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-500/20">
              <Save className="h-4 w-4" /> Concluir calibração
            </button>
          )}
        </div>

        {showHistory && <HistoryPanel />}

        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          {/* Steps */}
          <div className="space-y-3">
            {STEPS.map((s) => {
              const isOpen = openStep === s.id;
              const isSkipped = skipped.includes(s.id);
              const done = stepDone(s);
              const Icon = s.icon;
              return (
                <div key={s.id} className={`rounded-2xl border ${done ? "border-emerald-500/40 bg-emerald-500/[0.04]" : "border-white/10 bg-white/[0.03]"}`}>
                  <button
                    onClick={() => setOpenStep(isOpen ? "" : s.id)}
                    className="flex w-full items-center gap-3 p-4 text-left"
                  >
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${done ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-white/70"}`}>
                      {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white">{s.title}</div>
                      <div className="text-xs text-white/50">{s.desc}</div>
                    </div>
                    {isSkipped && <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/60">N/A</span>}
                    <ChevronRight className={`h-4 w-4 text-white/40 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                  </button>

                  {isOpen && (
                    <div className="border-t border-white/10 px-4 pb-4 pt-3">
                      <div className="space-y-2">
                        {s.tasks.map((t) => (
                          <label key={t.id} className="flex cursor-pointer items-start gap-2 rounded-lg p-2 hover:bg-white/5">
                            <input type="checkbox" checked={!!checked[t.id]} onChange={() => toggle(t.id)} className="mt-0.5 h-4 w-4" />
                            <div className="flex-1">
                              <div className="text-sm text-white/90">{t.label}</div>
                              {t.tip && <div className="text-xs text-white/50">{t.tip}</div>}
                            </div>
                          </label>
                        ))}
                      </div>

                      {/* per-step extras */}
                      {s.id === "esteps" && (
                        <CalcBox title="Calculadora E-steps">
                          <div className="grid grid-cols-2 gap-2">
                            <NumField label="E-steps atual" value={eCurrent} onChange={setECurrent} />
                            <NumField label="Sobra medida (mm)" value={eRemain} onChange={setERemain} />
                          </div>
                          {newEsteps && (
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <div className="rounded-lg bg-white/10 px-3 py-1.5 font-mono text-sm text-cyan-300">
                                Novo E-steps: {newEsteps.toFixed(2)}
                              </div>
                              <button onClick={() => send([`M92 E${newEsteps.toFixed(2)}`, "M500"])} className="rounded-lg bg-cyan-500/80 px-3 py-1.5 text-xs text-white hover:bg-cyan-500">
                                Enviar M92 + M500
                              </button>
                              <button onClick={() => { if (profile) { const np = { ...profile, esteps: newEsteps }; setProfile(np); saveProfile(np); } }} className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/20">
                                Salvar no perfil
                              </button>
                            </div>
                          )}
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button onClick={() => send(["M83", "G1 E100 F100"])} className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10">
                              Extrudar 100mm
                            </button>
                          </div>
                        </CalcBox>
                      )}

                      {s.id === "pid" && (
                        <CalcBox title="PID Tuning via G-code">
                          <div className="grid grid-cols-2 gap-2">
                            <NumField label="Temp bico (°C)" value={pidTemp} onChange={setPidTemp} />
                            <NumField label="Temp mesa (°C)" value={bedTemp} onChange={setBedTemp} />
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button onClick={() => send(`M303 E0 S${pidTemp} C8`)} className="rounded-lg bg-cyan-500/80 px-3 py-1.5 text-xs text-white">PID bico</button>
                            <button onClick={() => send(`M303 E-1 S${bedTemp} C8`)} className="rounded-lg bg-cyan-500/80 px-3 py-1.5 text-xs text-white">PID mesa</button>
                            <button onClick={() => send("M500")} className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80">Salvar EEPROM (M500)</button>
                          </div>
                          <p className="mt-2 text-xs text-white/40">Observe o terminal — copie Kp/Ki/Kd e envie M301 (bico) ou M304 (mesa) manualmente.</p>
                        </CalcBox>
                      )}

                      {s.id === "flow" && (
                        <CalcBox title="Calculadora Flow">
                          <div className="grid grid-cols-3 gap-2">
                            <NumField label="Esperado (mm)" value={flowExp} onChange={setFlowExp} />
                            <NumField label="Medido (mm)" value={flowMeas} onChange={setFlowMeas} />
                            <NumField label="Flow atual (%)" value={flowCur} onChange={setFlowCur} />
                          </div>
                          {newFlow && (
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <div className="rounded-lg bg-white/10 px-3 py-1.5 font-mono text-sm text-cyan-300">
                                Novo flow: {newFlow.toFixed(1)}%
                              </div>
                              <button onClick={() => { if (profile) { const np = { ...profile, flow: newFlow }; setProfile(np); saveProfile(np); } }} className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/20">
                                Salvar no perfil
                              </button>
                            </div>
                          )}
                        </CalcBox>
                      )}

                      {s.id === "endstops" && (
                        <CalcBox title="Movimentação manual">
                          <div className="grid grid-cols-3 gap-2">
                            <button onClick={() => send("G28")} className="rounded-lg bg-cyan-500/80 px-3 py-1.5 text-xs text-white">Home (G28)</button>
                            <button onClick={() => send(["G91", "G1 X10 F3000", "G90"])} className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80">+X 10</button>
                            <button onClick={() => send(["G91", "G1 Y10 F3000", "G90"])} className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80">+Y 10</button>
                            <button onClick={() => send(["G91", "G1 Z5 F600", "G90"])} className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80">+Z 5</button>
                            <button onClick={() => send(["G91", "G1 Z-5 F600", "G90"])} className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80">−Z 5</button>
                            <button onClick={() => send("M84")} className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80">Desligar motores</button>
                          </div>
                        </CalcBox>
                      )}

                      {s.id === "filsensor" && (
                        <CalcBox title="Sensor de filamento">
                          <div className="flex gap-2">
                            <button onClick={() => send("M412 S1")} className="rounded-lg bg-cyan-500/80 px-3 py-1.5 text-xs text-white">Ativar</button>
                            <button onClick={() => send("M412 S0")} className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80">Desativar</button>
                            <button onClick={() => send("M412")} className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80">Status</button>
                          </div>
                        </CalcBox>
                      )}

                      {s.video && (
                        <div className="mt-3 aspect-video w-full overflow-hidden rounded-lg border border-white/10">
                          <iframe src={s.video} title="tutorial" className="h-full w-full" allowFullScreen />
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
                        <button onClick={() => toggleSkip(s.id)} className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white">
                          <SkipForward className="h-3.5 w-3.5" />
                          {isSkipped ? "Reativar etapa" : "Marcar como N/A"}
                        </button>
                        {!s.video && (
                          <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent("3d printer " + s.title)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-rose-300 hover:text-rose-200">
                            <Youtube className="h-3.5 w-3.5" /> Buscar tutorial
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Terminal */}
          <div className="lg:sticky lg:top-20 lg:h-fit">
            <div className="rounded-2xl border border-white/10 bg-[#05050a] p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-white/60">
                  <Terminal className="h-3.5 w-3.5" /> Terminal G-code
                </div>
                {printer && <span className="text-xs text-white/40">{printer.type}</span>}
              </div>
              <div ref={logRef} className="h-64 overflow-y-auto rounded-lg bg-black/60 p-3 font-mono text-xs">
                {log.length === 0 ? (
                  <div className="text-white/30">Aguardando comandos…</div>
                ) : log.map((l, i) => (
                  <div key={i} className={l.ok === false ? "text-red-300" : l.ok === true ? "text-emerald-300" : "text-white/70"}>
                    {l.text}
                  </div>
                ))}
              </div>
              <form
                onSubmit={(e) => { e.preventDefault(); if (cmd.trim()) { send(cmd.trim()); setCmd(""); } }}
                className="mt-2 flex gap-2"
              >
                <input
                  value={cmd}
                  onChange={(e) => setCmd(e.target.value)}
                  placeholder="ex: M115"
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-white"
                />
                <button className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/80 px-3 py-2 text-xs text-white">
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
              <div className="mt-2 flex flex-wrap gap-1">
                {["M115", "M503", "M500", "G28"].map((c) => (
                  <button key={c} onClick={() => send(c)} className="rounded bg-white/5 px-2 py-1 font-mono text-[11px] text-white/60 hover:bg-white/10">
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {profile && (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-2 inline-flex items-center gap-2 text-xs uppercase tracking-wide text-white/60">
                  <PrinterIcon className="h-3.5 w-3.5" /> Perfil salvo
                </div>
                <ul className="space-y-1 text-xs text-white/70">
                  <li>E-steps: <span className="font-mono text-cyan-300">{profile.esteps?.toFixed(2) ?? "—"}</span></li>
                  <li>Flow: <span className="font-mono text-cyan-300">{profile.flow ? profile.flow.toFixed(1) + "%" : "—"}</span></li>
                  <li>Atualizado: <span className="text-white/50">{new Date(profile.updatedAt).toLocaleString("pt-BR")}</span></li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function CalcBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3">
      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-cyan-300">{title}</div>
      {children}
    </div>
  );
}

function NumField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wide text-white/50">{label}</span>
      <input
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-0.5 w-full rounded-md border border-white/10 bg-white/5 px-2 py-1 font-mono text-sm text-white"
      />
    </label>
  );
}

function HistoryPanel() {
  const [runs] = useState(() => listRuns());
  if (!runs.length) {
    return <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-white/50">Sem calibrações concluídas ainda.</div>;
  }
  return (
    <div className="mb-4 overflow-hidden rounded-2xl border border-white/10">
      <table className="w-full text-sm">
        <thead className="bg-white/[0.04] text-xs uppercase text-white/50">
          <tr><th className="px-4 py-2 text-left">Data</th><th className="px-4 py-2 text-left">Impressora</th><th className="px-4 py-2 text-left">Etapas</th><th className="px-4 py-2 text-left">Mudanças</th></tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-white/75">
          {runs.slice(0, 20).map((r) => (
            <tr key={r.id}>
              <td className="px-4 py-2 text-white/50">{new Date(r.at).toLocaleString("pt-BR")}</td>
              <td className="px-4 py-2">{r.printerName}</td>
              <td className="px-4 py-2">{r.completedSteps.length}/{STEPS.length}</td>
              <td className="px-4 py-2 font-mono text-xs text-cyan-300">
                {r.changes.esteps ? `E:${r.changes.esteps.toFixed(2)} ` : ""}
                {r.changes.flow ? `F:${r.changes.flow.toFixed(1)}%` : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
