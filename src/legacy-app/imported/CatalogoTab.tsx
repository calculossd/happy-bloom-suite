import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  Upload,
  Search,
  Trash2,
  Download,
  Eye,
  Send,
  Boxes,
  Archive,
  Tag as TagIcon,
} from "lucide-react";
import {
  listModels,
  saveModel,
  deleteModel,
  getFile,
  findByHash,
  hashFile,
  CATEGORIES,
  type ModelRecord,
} from "@/lib/catalog-db";
import { loadAsStl } from "@/lib/threemf";
import { renderStlThumbnail } from "@/lib/stl-thumbnail";
import { SendToPrinterDialog } from "@/components/SendToPrinterDialog";
import JSZip from "jszip";

type UploadProgress = { name: string; pct: number; status: "uploading" | "done" | "dup" | "error"; message?: string };

function CatalogPage() {
  const [models, setModels] = useState<ModelRecord[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [fileType, setFileType] = useState<"all" | "stl" | "3mf">("all");
  const [sortBy, setSortBy] = useState<"date" | "name" | "size">("date");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [sendModel, setSendModel] = useState<ModelRecord | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const refresh = async () => setModels(await listModels());
  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => {
    let m = models;
    if (category !== "all") m = m.filter((x) => x.category === category);
    if (fileType !== "all") m = m.filter((x) => x.fileType === fileType);
    if (query.trim()) {
      const q = query.toLowerCase();
      m = m.filter((x) =>
        x.name.toLowerCase().includes(q) ||
        x.notes.toLowerCase().includes(q) ||
        x.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    const s = [...m];
    if (sortBy === "name") s.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "size") s.sort((a, b) => b.size - a.size);
    return s;
  }, [models, query, category, fileType, sortBy]);

  const handleFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => /\.(stl|3mf)$/i.test(f.name));
    if (!arr.length) return;
    const initial = arr.map((f) => ({ name: f.name, pct: 0, status: "uploading" as const }));
    setUploads((u) => [...u, ...initial]);

    for (let i = 0; i < arr.length; i++) {
      const file = arr[i];
      const idx = uploads.length + i;
      try {
        setUploads((u) => u.map((x, j) => (j === idx ? { ...x, pct: 15 } : x)));
        const hash = await hashFile(file);
        const dup = await findByHash(hash);
        if (dup) {
          setUploads((u) => u.map((x, j) => (j === idx ? { ...x, pct: 100, status: "dup", message: "Já existe" } : x)));
          continue;
        }
        const type: "stl" | "3mf" = file.name.toLowerCase().endsWith(".3mf") ? "3mf" : "stl";
        setUploads((u) => u.map((x, j) => (j === idx ? { ...x, pct: 45 } : x)));
        let thumb: string | undefined;
        try {
          const stl = await loadAsStl(file, type);
          const r = await renderStlThumbnail(stl);
          thumb = r.dataUrl;
        } catch (e) {
          // thumbnail optional
          console.warn("thumbnail fail", e);
        }
        setUploads((u) => u.map((x, j) => (j === idx ? { ...x, pct: 80 } : x)));
        const now = Date.now();
        const rec: ModelRecord = {
          id: crypto.randomUUID(),
          name: file.name.replace(/\.(stl|3mf)$/i, ""),
          fileName: file.name,
          fileType: type,
          size: file.size,
          hash,
          category: "Decoração",
          tags: [],
          notes: "",
          unit: "mm",
          scale: 1,
          thumbnail: thumb,
          createdAt: now,
          updatedAt: now,
        };
        await saveModel(rec, file);
        setUploads((u) => u.map((x, j) => (j === idx ? { ...x, pct: 100, status: "done" } : x)));
      } catch (e: any) {
        setUploads((u) => u.map((x, j) => (j === idx ? { ...x, pct: 100, status: "error", message: e?.message } : x)));
      }
    }
    refresh();
    setTimeout(() => setUploads((u) => u.filter((x) => x.status === "uploading")), 2500);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  const toggleSel = (id: string) => {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const bulkDelete = async () => {
    if (!selected.size) return;
    if (!confirm(`Excluir ${selected.size} modelo(s)?`)) return;
    for (const id of selected) await deleteModel(id);
    setSelected(new Set());
    refresh();
  };

  const bulkDownload = async () => {
    const ids = selected.size ? Array.from(selected) : models.map((m) => m.id);
    if (!ids.length) return;
    const zip = new JSZip();
    const meta: any[] = [];
    for (const id of ids) {
      const m = models.find((x) => x.id === id) || (await listModels()).find((x) => x.id === id);
      if (!m) continue;
      const f = await getFile(id);
      if (f) zip.file(`files/${m.fileName}`, f);
      meta.push(m);
    }
    zip.file("catalog.json", JSON.stringify(meta, null, 2));
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `catalogo-3d-${new Date().toISOString().slice(0, 10)}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadOne = async (m: ModelRecord) => {
    const f = await getFile(m.id);
    if (!f) return;
    const url = URL.createObjectURL(f);
    const a = document.createElement("a");
    a.href = url;
    a.download = m.fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const removeOne = async (m: ModelRecord) => {
    if (!confirm(`Excluir "${m.name}"?`)) return;
    await deleteModel(m.id);
    refresh();
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl 2xl:max-w-[1600px] px-6 pt-20 pb-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>
              Catálogo 3D
            </h1>
            <p className="mt-1 text-sm text-white/60">
              {models.length} modelo(s) — biblioteca local, funciona offline
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={bulkDownload}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
            >
              <Archive className="h-4 w-4" /> Backup ZIP {selected.size ? `(${selected.size})` : "(todos)"}
            </button>
            {selected.size > 0 && (
              <button
                onClick={bulkDelete}
                className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200 hover:bg-red-500/20"
              >
                <Trash2 className="h-4 w-4" /> Excluir ({selected.size})
              </button>
            )}
          </div>
        </div>

        {/* Upload zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`mb-6 cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
            dragOver
              ? "border-cyan-400/60 bg-cyan-500/10"
              : "border-white/15 bg-white/[0.02] hover:bg-white/[0.04]"
          }`}
        >
          <Upload className="mx-auto h-8 w-8 text-white/60" />
          <p className="mt-3 text-sm text-white/80">
            Arraste arquivos <span className="font-mono text-cyan-300">.stl</span> e{" "}
            <span className="font-mono text-cyan-300">.3mf</span> aqui — ou clique para selecionar
          </p>
          <p className="mt-1 text-xs text-white/40">Miniaturas geradas automaticamente</p>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".stl,.3mf"
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
        </div>

        {uploads.length > 0 && (
          <div className="mb-6 space-y-2">
            {uploads.map((u, i) => (
              <div key={i} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <div className="flex justify-between text-xs text-white/70">
                  <span className="truncate">{u.name}</span>
                  <span>
                    {u.status === "done" && "✓ pronto"}
                    {u.status === "dup" && "duplicado"}
                    {u.status === "error" && `erro: ${u.message}`}
                    {u.status === "uploading" && `${u.pct}%`}
                  </span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full transition-all ${
                      u.status === "error" ? "bg-red-400" : u.status === "dup" ? "bg-amber-400" : "bg-cyan-400"
                    }`}
                    style={{ width: `${u.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome, tag, notas…"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2 pl-10 pr-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-cyan-400/50"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white"
          >
            <option value="all" className="bg-[#0b0b14]">Todas categorias</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-[#0b0b14]">{c}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value as any)}
              className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white"
            >
              <option value="all" className="bg-[#0b0b14]">Todos</option>
              <option value="stl" className="bg-[#0b0b14]">STL</option>
              <option value="3mf" className="bg-[#0b0b14]">3MF</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white"
            >
              <option value="date" className="bg-[#0b0b14]">Data</option>
              <option value="name" className="bg-[#0b0b14]">Nome</option>
              <option value="size" className="bg-[#0b0b14]">Tamanho</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-16 text-center">
            <Boxes className="mx-auto h-10 w-10 text-white/30" />
            <p className="mt-3 text-white/60">{models.length === 0 ? "Sem modelos ainda" : "Nenhum modelo encontrado"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((m) => (
              <div
                key={m.id}
                className={`group relative rounded-2xl border ${
                  selected.has(m.id) ? "border-cyan-400/60" : "border-white/10"
                } bg-white/[0.03] p-3 transition-all hover:-translate-y-0.5 hover:bg-white/[0.05]`}
              >
                <label className="absolute left-4 top-4 z-10">
                  <input
                    type="checkbox"
                    checked={selected.has(m.id)}
                    onChange={() => toggleSel(m.id)}
                    className="h-4 w-4 cursor-pointer"
                  />
                </label>
                <div className="block"
                >
                  <div className="aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-white/[0.04] to-white/[0.01]">
                    {m.thumbnail ? (
                      <img src={m.thumbnail} alt={m.name} className="h-full w-full object-contain" loading="lazy" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-white/30">
                        <Boxes className="h-12 w-12" />
                      </div>
                    )}
                  </div>
                  <div className="mt-3">
                    <div className="truncate text-sm font-medium text-white">{m.name}</div>
                    <div className="mt-1 flex items-center justify-between text-xs text-white/50">
                      <span className="uppercase">{m.fileType}</span>
                      <span>{(m.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                    {m.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {m.tags.slice(0, 3).map((t) => (
                          <span key={t} className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-white/70">
                            <TagIcon className="h-2.5 w-2.5" /> {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex-1 rounded-lg border border-white/10 bg-white/5 py-1.5 text-center text-xs text-white/80 hover:bg-white/10"
                  >
                    <Eye className="mx-auto h-3.5 w-3.5" />
                  </div>
                  <button
                    onClick={() => setSendModel(m)}
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 py-1.5 text-xs text-white/80 hover:bg-white/10"
                    title="Enviar para impressora"
                  >
                    <Send className="mx-auto h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => downloadOne(m)}
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 py-1.5 text-xs text-white/80 hover:bg-white/10"
                  >
                    <Download className="mx-auto h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => removeOne(m)}
                    className="flex-1 rounded-lg border border-red-500/30 bg-red-500/10 py-1.5 text-xs text-red-200 hover:bg-red-500/20"
                  >
                    <Trash2 className="mx-auto h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <SendToPrinterDialog model={sendModel} open={!!sendModel} onClose={() => setSendModel(null)} />
    </AppShell>
  );
}

export default CatalogPage;
