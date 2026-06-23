import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

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
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [cat, setCat] = useState("Modelos");
  const [showAdd, setShowAdd] = useState(false);

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
  const filtered = all;

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;
    const full = url.startsWith("http") ? url : `https://${url}`;
    setExtra((x) => [...x, { id: crypto.randomUUID(), name: name.trim(), url: full, category: cat }]);
    setName(""); setUrl(""); setShowAdd(false);
  };

  const remove = (id: string) => {
    if (PRESETS.find((p) => p.id === id)) setHidden((h) => [...h, id]);
    else setExtra((x) => x.filter((l) => l.id !== id));
  };

  const favicon = (u: string) => `https://www.google.com/s2/favicons?domain=${new URL(u).hostname}&sz=128`;
  const hostname = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; } };

  // Group filtered links by category for the sectioned logo grid
  const grouped = useMemo(() => {
    const map = new Map<string, Link[]>();
    for (const l of filtered) {
      if (!map.has(l.category)) map.set(l.category, []);
      map.get(l.category)!.push(l);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#050507] text-white">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/3 h-[420px] w-[420px] rounded-full bg-[#b7ff00]/10 blur-[140px]" />
      </div>
      <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1600px] px-6 py-12 md:px-10">
        {showAdd && (
          <form onSubmit={add} className="mb-6 grid grid-cols-1 gap-2 rounded-3xl border border-white/10 bg-white/[0.02] p-4 md:grid-cols-[1fr_1fr_160px_auto] backdrop-blur-xl">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do site" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-[#b7ff00]/50 focus:outline-none" />
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-[#b7ff00]/50 focus:outline-none" />
            <select value={cat} onChange={(e) => setCat(e.target.value)} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-[#b7ff00]/50 focus:outline-none">
              {["Modelos","Modelagem","Software","Outros"].map((c) => <option key={c} value={c} className="bg-[#0a0a0f]">{c}</option>)}
            </select>
            <button type="submit" className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#b7ff00] px-4 py-2 text-sm font-bold text-black hover:brightness-110 active:scale-95 shadow-[0_0_18px_-6px_rgba(183,255,0,0.7)]">
              <Plus className="h-4 w-4" /> Salvar
            </button>
          </form>
        )}

        {/* Sections by category — logo-only tiles */}
        <div className="space-y-8">
          {grouped.map(([category, items]) => (
            <section key={category}>
              <div className="mb-3 flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#b7ff00]">{category}</span>
                <span className="h-px flex-1 bg-gradient-to-r from-[#b7ff00]/30 to-transparent" />
                <span className="text-[10px] text-white/40 font-mono">{items.length}</span>
              </div>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                {items.map((l) => (
                  <div key={l.id} className="group relative">
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      title={`${l.name} — ${hostname(l.url)}`}
                      className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3 transition-all hover:-translate-y-0.5 hover:border-[#b7ff00]/50 hover:bg-white/[0.05] hover:shadow-[0_12px_40px_-12px_rgba(183,255,0,0.35)]"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/95 p-1.5 shadow-inner">
                        <img
                          src={favicon(l.url)}
                          alt={l.name}
                          loading="lazy"
                          className="h-full w-full object-contain"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0.3"; }}
                        />
                      </div>
                      <span className="block w-full truncate text-center text-[10px] font-semibold text-white/80 group-hover:text-[#b7ff00]">
                        {l.name}
                      </span>
                    </a>
                    <button
                      onClick={() => remove(l.id)}
                      aria-label="Remover"
                      className="absolute top-1 right-1 z-10 rounded-full bg-black/70 p-1 text-white/60 opacity-0 backdrop-blur transition-opacity hover:text-rose-400 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="mt-8 text-center text-sm text-white/40">Nenhum site encontrado.</p>
        )}

        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          aria-label="Adicionar site"
          title="Adicionar site"
          className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#b7ff00] text-black shadow-[0_0_34px_-8px_rgba(183,255,0,0.95)] transition hover:brightness-110 active:scale-95"
        >
          <Plus className="h-7 w-7 stroke-[3px]" />
        </button>
      </div>
    </div>
  );
}

export default SitesPage;
