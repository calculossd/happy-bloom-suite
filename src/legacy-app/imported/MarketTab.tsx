import { useEffect, useMemo, useState } from "react";
import { RefreshCw, ExternalLink, Download, Heart, ImageOff, Lightbulb, Check, Search, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import {
  findByHash,
  hashFile,
  saveModel,
  type ModelRecord,
} from "@/lib/catalog-db";
import { loadAsStl } from "@/lib/threemf";
import { renderStlThumbnail } from "@/lib/stl-thumbnail";
import { addIdeaToKanban, isIdeaInKanban, removeIdeaFromKanban } from "@/lib/kanban-ideas";

type TrendItem = {
  id: string;
  title: string;
  thumbnail: string;
  author: string;
  source: string;
  url: string;
  download_url?: string;
  stats?: { likes?: number; downloads?: number };
};

type ApiPayload = {
  items: TrendItem[];
  errors: { source: string; message: string }[];
  updated_at: number;
};

const SOURCE_COLORS: Record<string, string> = {
  MakerWorld: "bg-amber-500/20 text-amber-200 border-amber-400/30",
};

function formatAgo(ts: number) {
  const min = Math.floor((Date.now() - ts) / 60000);
  if (min < 1) return "agora mesmo";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  return `há ${h}h`;
}

function MarketPage() {
  const [data, setData] = useState<ApiPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [importing, setImporting] = useState<string | null>(null);
  const [ideaUrls, setIdeaUrls] = useState<Set<string>>(new Set());

  useEffect(() => {
    const sync = () => {
      if (typeof window === "undefined") return;
      try {
        const raw = localStorage.getItem("kanban-board-v1");
        if (!raw) return setIdeaUrls(new Set());
        const board = JSON.parse(raw) as Array<{ cards: Array<{ url?: string }> }>;
        const urls = new Set<string>();
        board.forEach((c) => c.cards.forEach((k) => k.url && urls.add(k.url)));
        setIdeaUrls(urls);
      } catch {}
    };
    sync();
    window.addEventListener("kanban-ideas:changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("kanban-ideas:changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggleIdea = (item: TrendItem) => {
    if (ideaUrls.has(item.url)) {
      removeIdeaFromKanban(item.url);
      toast.info("Removido das Ideias do Kanban");
    } else {
      addIdeaToKanban({
        title: item.title,
        url: item.url,
        thumbnail: item.thumbnail,
        source: item.source,
        note: item.author ? `Autor: ${item.author}` : undefined,
      });
      toast.success("Enviado para Ideias no Kanban", { description: item.title });
    }
  };

  const [category, setCategory] = useState<string>("trending");
  const [search, setSearch] = useState<string>("");
  const [submittedQuery, setSubmittedQuery] = useState<{ q?: string; cat?: string }>({ cat: "trending" });

  const load = async (force = false, q?: { q?: string; cat?: string }) => {
    setLoading(true);
    setErr(null);
    try {
      const params = new URLSearchParams();
      if (force) params.set("refresh", "1");
      const target = q ?? submittedQuery;
      if (target.q) params.set("q", target.q);
      else if (target.cat) params.set("cat", target.cat);
      const r = await fetch(`/api/3d-trends?${params.toString()}`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j: ApiPayload = await r.json();
      setData(j);
    } catch (e: any) {
      setErr(e?.message || "Falha ao carregar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(false, submittedQuery); }, [submittedQuery]);

  const submitSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const v = search.trim();
    if (!v) { setSubmittedQuery({ cat: category }); return; }
    setSubmittedQuery({ q: v });
  };

  const pickCategory = (c: string) => {
    setCategory(c);
    setSearch("");
    setSubmittedQuery({ cat: c });
  };

  const clearSearch = () => {
    setSearch("");
    setSubmittedQuery({ cat: category });
  };

  const filtered = useMemo(() => data?.items ?? [], [data]);

  const importItem = async (item: TrendItem) => {
    if (!item.download_url) {
      window.open(item.url, "_blank", "noopener,noreferrer");
      toast.info("Abrindo página original", {
        description: "Esta plataforma não fornece download direto.",
      });
      return;
    }
    setImporting(item.id);
    try {
      const resp = await fetch(item.download_url);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const blob = await resp.blob();
      const fileName = item.download_url.split("/").pop()?.split("?")[0] || `${item.title}.stl`;
      const file = new File([blob], fileName, { type: blob.type });
      const hash = await hashFile(file);
      const dup = await findByHash(hash);
      if (dup) {
        toast.warning("Já existe no catálogo", { description: dup.name });
        return;
      }
      const type: "stl" | "3mf" = fileName.toLowerCase().endsWith(".3mf") ? "3mf" : "stl";
      let thumbnail: string | undefined;
      try {
        const stl = await loadAsStl(file, type);
        thumbnail = (await renderStlThumbnail(stl)).dataUrl;
      } catch {
        thumbnail = item.thumbnail || undefined;
      }
      const now = Date.now();
      const rec: ModelRecord = {
        id: crypto.randomUUID(),
        name: item.title,
        fileName,
        fileType: type,
        size: file.size,
        hash,
        category: "Decoração",
        tags: ["importado", item.source.toLowerCase()],
        notes: item.author ? `Autor: ${item.author}` : "",
        unit: "mm",
        scale: 1,
        thumbnail,
        source: { name: item.source, url: item.url },
        createdAt: now,
        updatedAt: now,
      };
      await saveModel(rec, file);
      toast.success("Adicionado ao catálogo", { description: item.title });
    } catch (e: any) {
      toast.error("Falha ao importar", { description: e?.message });
    } finally {
      setImporting(null);
    }
  };

  return (
    <AppShell>
      <div className="relative min-h-screen w-full overflow-hidden">
        {/* Ambient background glows — matching dashboard */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/3 h-[520px] w-[520px] rounded-full bg-cyan-500/10 blur-[140px]" />
          <div className="absolute top-1/2 -right-32 h-[420px] w-[420px] rounded-full bg-violet-600/10 blur-[140px]" />
          <div className="absolute bottom-0 left-0 h-[380px] w-[380px] rounded-full bg-blue-600/10 blur-[140px]" />
        </div>

        <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1600px] px-6 py-12 md:px-10 md:py-16 space-y-8">
          {/* Search bar */}
          <form onSubmit={submitSearch} className="flex items-center gap-2 rounded-3xl border border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur-xl transition-colors focus-within:border-cyan-400/40">
            <Search className="h-4 w-4 text-cyan-400/70" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar (palavra, link makerworld.com/… ou ID numérico)"
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
            />
            {search && (
              <button type="button" onClick={clearSearch} className="text-white/40 hover:text-white" aria-label="Limpar">
                <X className="h-4 w-4" />
              </button>
            )}
            <button type="submit" className="rounded-full border border-cyan-400/30 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 px-4 py-1.5 text-xs font-medium text-cyan-100 hover:from-cyan-500/30 hover:to-blue-600/30">
              Buscar
            </button>
          </form>

          {/* Categories */}
          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-white/40">Categorias</p>
              <button
                onClick={() => load(true)}
                disabled={loading}
                title="Atualizar"
                aria-label="Atualizar"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-1.5 text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {["trending","hobby","art","tools","toy","game","education","fashion","home decor","gadget","miniature","cosplay","sports","vehicle","organizer","articulated","functional print"].map((c) => {
                const active = !submittedQuery.q && submittedQuery.cat === c;
                return (
                  <button
                    key={c}
                    onClick={() => pickCategory(c)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize transition-all ${
                      active
                        ? "border-cyan-400/50 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-cyan-100 shadow-[0_0_24px_-8px_rgba(34,211,238,0.5)]"
                        : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

        {/* Errors */}
        {data?.errors && data.errors.length > 0 && (
          <div className="mb-6 rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-xs text-amber-200">
            Algumas buscas falharam: {data.errors.length}
          </div>
        )}

        {/* Error state */}
        {err && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
            <p className="text-red-200">{err}</p>
            <button
              onClick={() => load(true)}
              className="mt-4 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && !data && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-white/10 bg-white/[0.03] p-3"
              >
                <div className="aspect-square rounded-xl bg-white/5" />
                <div className="mt-3 h-4 w-3/4 rounded bg-white/10" />
                <div className="mt-2 h-3 w-1/2 rounded bg-white/5" />
              </div>
            ))}
          </div>
        )}

        {/* MakerWorld grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((item) => (
              <article
                key={item.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06]"
              >
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative block aspect-square overflow-hidden bg-gradient-to-br from-white/[0.04] to-white/[0.01]"
                >
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-white/30">
                      <ImageOff className="h-10 w-10" />
                    </div>
                  )}
                  <span
                    className={`absolute left-2 top-2 rounded-full border px-2 py-0.5 text-[10px] font-medium backdrop-blur ${
                      SOURCE_COLORS[item.source] ||
                      "bg-white/10 text-white border-white/20"
                    }`}
                  >
                    {item.source}
                  </span>
                </a>
                <div className="flex flex-1 flex-col p-3">
                  <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium text-white">
                    {item.title}
                  </h3>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-white/50">
                    <span className="truncate">{item.author || "—"}</span>
                    {item.stats && (item.stats.likes || item.stats.downloads) ? (
                      <span className="flex items-center gap-2">
                        {item.stats.likes ? (
                          <span className="inline-flex items-center gap-0.5">
                            <Heart className="h-3 w-3" /> {item.stats.likes}
                          </span>
                        ) : null}
                        {item.stats.downloads ? (
                          <span className="inline-flex items-center gap-0.5">
                            <Download className="h-3 w-3" /> {item.stats.downloads}
                          </span>
                        ) : null}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => importItem(item)}
                      disabled={importing === item.id}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-cyan-400/30 bg-cyan-500/10 py-1.5 text-xs font-medium text-cyan-200 transition-colors hover:bg-cyan-500/20 disabled:opacity-50"
                    >
                      {importing === item.id ? (
                        <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Importando…</>
                      ) : item.download_url ? (
                        <><Download className="h-3.5 w-3.5" /> Catálogo</>
                      ) : (
                        <><ExternalLink className="h-3.5 w-3.5" /> Abrir</>
                      )}
                    </button>
                    <button
                      onClick={() => toggleIdea(item)}
                      title={ideaUrls.has(item.url) ? "Remover das Ideias" : "Enviar para Ideias (Kanban)"}
                      className={`inline-flex items-center justify-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        ideaUrls.has(item.url)
                          ? "border-fuchsia-400/50 bg-fuchsia-500/20 text-fuchsia-100 hover:bg-fuchsia-500/30"
                          : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10 hover:text-fuchsia-200"
                      }`}
                    >
                      {ideaUrls.has(item.url) ? <Check className="h-3.5 w-3.5" /> : <Lightbulb className="h-3.5 w-3.5" />}
                      Ideia
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && data && filtered.length === 0 && !err && (
          <div className="rounded-2xl border border-dashed border-white/10 p-16 text-center text-white/60">
            Nenhum modelo encontrado.
          </div>
        )}
        </div>
      </div>
    </AppShell>
  );
}

export default MarketPage;
