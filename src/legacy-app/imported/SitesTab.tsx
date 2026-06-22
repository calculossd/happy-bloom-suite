import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Plus, Trash2, Search } from "lucide-react";

export const Route = createFileRoute("/sites")({
  head: () => ({
    meta: [
      { title: "Sites & Ferramentas — ImpreMetrics 3D" },
      { name: "description", content: "Diretório curado de sites e ferramentas para impressão 3D: MakerWorld, Printables, Cults, Thangs e mais." },
    ],
  }),
  component: SitesPage,
});

type Link = { id: string; name: string; url: string; category: string; desc?: string };

const PRESETS: Link[] = [
  // Modelos / Marketplaces
  { id: "p1", name: "MakerWorld", url: "https://makerworld.com", category: "Modelos", desc: "Comunidade Bambu Lab com prints prontos." },
  { id: "p2", name: "Printables", url: "https://www.printables.com", category: "Modelos", desc: "Plataforma da Prusa, muitos contests." },
  { id: "p3", name: "Thingiverse", url: "https://www.thingiverse.com", category: "Modelos", desc: "Maior biblioteca de modelos gratuitos." },
  { id: "p4", name: "Cults 3D", url: "https://cults3d.com", category: "Modelos", desc: "Marketplace de STLs premium." },
  { id: "p5", name: "MyMiniFactory", url: "https://www.myminifactory.com", category: "Modelos", desc: "Foco em miniaturas e tabletop." },
  { id: "p6", name: "Thangs", url: "https://thangs.com", category: "Modelos", desc: "Busca geométrica entre milhões de STLs." },
  { id: "p7", name: "Pinshape", url: "https://pinshape.com", category: "Modelos", desc: "Modelos clássicos da Formlabs." },

  // Modelagem (IA / Generativo)
  { id: "m1", name: "Hunyuan 3D", url: "https://3d.hunyuanglobal.com/login-email", category: "Modelagem", desc: "Geração de modelos 3D por IA da Tencent." },
  { id: "m2", name: "MakerLab (MakerWorld)", url: "https://makerworld.com/pt/makerlab", category: "Modelagem", desc: "Ferramentas de modelagem e personalização do MakerWorld." },
  { id: "m3", name: "Gridfinity Generator", url: "https://gridfinitygenerator.com/en/editor", category: "Modelagem", desc: "Editor online para criar peças do sistema Gridfinity." },
  { id: "m4", name: "Mesh Texture", url: "https://www.meshtexture.com/", category: "Modelagem", desc: "Aplicar texturas em malhas 3D direto no navegador." },
  { id: "m5", name: "Neural4D Studio", url: "https://www.neural4d.com/studio", category: "Modelagem", desc: "Geração de modelos 3D por IA." },


  // Fatiadores / Software
  { id: "s1", name: "Bambu Studio", url: "https://bambulab.com/en/download/studio", category: "Software", desc: "Slicer da Bambu Lab." },
  { id: "s2", name: "OrcaSlicer", url: "https://github.com/SoftFever/OrcaSlicer", category: "Software", desc: "Fork open-source com calibração avançada." },
  { id: "s3", name: "PrusaSlicer", url: "https://www.prusa3d.com/prusaslicer/", category: "Software", desc: "Fatiador clássico, muito estável." },
  { id: "s4", name: "Cura", url: "https://ultimaker.com/software/ultimaker-cura/", category: "Software", desc: "Slicer mais popular do mercado." },
  { id: "s5", name: "Meshmixer", url: "https://meshmixer.com", category: "Software", desc: "Reparo e edição de malhas." },
  { id: "s6", name: "TinkerCAD", url: "https://www.tinkercad.com", category: "Software", desc: "CAD online simples e gratuito." },
  { id: "s7", name: "Fusion 360", url: "https://www.autodesk.com/products/fusion-360", category: "Software", desc: "CAD paramétrico profissional." },

];

const STORAGE_KEY = "sites-directory-v1";

function SitesPage() {
  const [extra, setExtra] = useState<Link[]>([]);
  const [hidden, setHidden] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [activeCat, setActiveCat] = useState<string>("Todos");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [cat, setCat] = useState("Modelos");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) { const s = JSON.parse(raw); setExtra(s.extra || []); setHidden(s.hidden || []); }
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ extra, hidden }));
  }, [extra, hidden]);

  const all = useMemo(() => [...PRESETS.filter((p) => !hidden.includes(p.id)), ...extra], [extra, hidden]);
  const categories = useMemo(() => ["Todos", ...Array.from(new Set(all.map((l) => l.category)))], [all]);
  const filtered = all.filter((l) =>
    (activeCat === "Todos" || l.category === activeCat) &&
    (q === "" || l.name.toLowerCase().includes(q.toLowerCase()) || (l.desc || "").toLowerCase().includes(q.toLowerCase()))
  );

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;
    const full = url.startsWith("http") ? url : `https://${url}`;
    setExtra((x) => [...x, { id: crypto.randomUUID(), name: name.trim(), url: full, category: cat }]);
    setName(""); setUrl("");
  };

  const remove = (id: string) => {
    if (PRESETS.find((p) => p.id === id)) setHidden((h) => [...h, id]);
    else setExtra((x) => x.filter((l) => l.id !== id));
  };

  const favicon = (u: string) => `https://www.google.com/s2/favicons?domain=${new URL(u).hostname}&sz=64`;
  const screenshot = (u: string) => `https://image.thum.io/get/width/800/crop/500/${u}`;
  const hostname = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; } };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#050507] text-white">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/3 h-[420px] w-[420px] rounded-full bg-emerald-500/10 blur-[140px]" />
      </div>
      <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1600px] px-6 py-12 md:px-10">
        <header className="mb-10 border-b border-white/10 pb-6">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.3em] text-emerald-400">Recursos</p>
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl" style={{ fontFamily: "'Sora', sans-serif" }}>
            Sites & Ferramentas
          </h1>
          <p className="mt-2 text-sm text-white/50">
            Diretório curado com MakerWorld, Printables, Cults, Thangs, fatiadores, calibração e mais. Adicione os seus.
          </p>
        </header>

        {/* Add form */}
        <form onSubmit={add} className="mb-6 grid grid-cols-1 gap-2 rounded-3xl border border-white/10 bg-white/[0.02] p-4 md:grid-cols-[1fr_1fr_160px_auto] backdrop-blur-xl">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do site" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-emerald-400/50 focus:outline-none" />
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-emerald-400/50 focus:outline-none" />
          <select value={cat} onChange={(e) => setCat(e.target.value)} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-emerald-400/50 focus:outline-none">
            {["Modelos","Modelagem","Software","Outros"].map((c) => <option key={c} value={c} className="bg-[#0a0a0f]">{c}</option>)}
          </select>
          <button type="submit" className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-bold text-black hover:bg-emerald-300 active:scale-95">
            <Plus className="h-4 w-4" /> Adicionar
          </button>
        </form>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar…" className="w-full rounded-full border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm focus:border-emerald-400/50 focus:outline-none" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <button key={c} onClick={() => setActiveCat(c)} className={`rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wider transition-all ${activeCat === c ? "bg-white text-black" : "border border-white/10 text-white/60 hover:bg-white/10"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((l) => (
            <div key={l.id} className="group relative">
              <a
                href={l.url}
                target="_blank"
                rel="noreferrer noopener"
                className="block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-all hover:-translate-y-1 hover:border-emerald-400/40 hover:shadow-[0_20px_60px_-15px_rgba(16,185,129,0.35)]"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-white/[0.06] to-white/[0.01]">
                  <img
                    src={screenshot(l.url)}
                    alt={l.name}
                    loading="lazy"
                    className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <span className="absolute top-3 right-3 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-300 backdrop-blur">{l.category}</span>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                    <img src={favicon(l.url)} alt="" className="h-8 w-8 shrink-0 rounded-lg border border-white/20 bg-white/10 p-1 backdrop-blur" />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-bold text-white">{l.name}</h3>
                      <p className="truncate text-[10px] text-white/60">{hostname(l.url)}</p>
                    </div>
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-black transition-transform group-hover:translate-x-0.5">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
                {l.desc && <p className="px-4 py-3 text-xs text-white/50 line-clamp-2">{l.desc}</p>}
              </a>
              <button
                onClick={() => remove(l.id)}
                aria-label="Remover"
                className="absolute top-2 left-2 z-10 rounded-full bg-black/60 p-1.5 text-white/60 opacity-0 backdrop-blur transition-opacity hover:text-rose-400 group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="mt-8 text-center text-sm text-white/40">Nenhum site encontrado.</p>
        )}
      </div>
    </div>
  );
}
