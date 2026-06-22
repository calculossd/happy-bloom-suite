import { useState } from "react";
import { Download, Upload, Copy, Save, Palette } from "lucide-react";
import { Btn, Card, Field, Input, Textarea } from "../primitives";
import { useBrand, useStore } from "@/lib/g3d/store";
import { THEMES, downloadJson, normalizeDropbox, parseBackup, serializeBackup, type ThemeName } from "@/lib/g3d/utils";

export function AjustesTab() {
  const { brand, updateBrand } = useBrand();
  const { state, replaceAll, reset } = useStore();
  const [name, setName] = useState(brand.name);
  const [logo, setLogo] = useState(brand.logoUrl);
  const [apkUrl, setApkUrl] = useState("");
  const [restoreText, setRestoreText] = useState("");
  const [copied, setCopied] = useState(false);

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-white">Ajustes, Temas & Backup</h2>

      <Card>
        <h3 className="mb-3 text-sm font-semibold text-white/80">Identidade Visual (White-Label)</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nome do Ateliê"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="URL do Logotipo"><Input value={logo} onChange={(e) => setLogo(e.target.value)} placeholder="https://..." /></Field>
        </div>
        <div className="mt-3 flex gap-2">
          <Btn onClick={() => updateBrand({ name, logoUrl: logo })}>
            <Save className="h-4 w-4" /> Aplicar Configuração
          </Btn>
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-center gap-2">
          <Palette className="h-4 w-4 text-[var(--brand-primary)]" />
          <h3 className="text-sm font-semibold text-white/80">Tema Visual</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(THEMES) as ThemeName[]).map((k) => {
            const t = THEMES[k];
            const active = brand.theme === k;
            return (
              <button
                key={k}
                onClick={() => updateBrand({ theme: k })}
                className={`rounded-2xl border p-3 text-left transition ${
                  active ? "border-[var(--brand-primary)] ring-2 ring-[var(--brand-primary)]/30" : "border-white/10 hover:border-white/30"
                }`}
                style={{ background: t.bg }}
              >
                <div className="mb-2 flex gap-1">
                  <span className="h-6 w-6 rounded-full" style={{ background: t.primary }} />
                  <span className="h-6 w-6 rounded-full border border-white/10" style={{ background: t.card }} />
                </div>
                <div className="text-sm font-bold text-white">{t.label}</div>
                <div className="text-[10px] text-white/40">{t.primary}</div>
              </button>
            );
          })}
        </div>
      </Card>

      <Card>
        <h3 className="mb-3 text-sm font-semibold text-white/80">Backup & Restauração</h3>
        <div className="flex flex-wrap gap-2">
          <Btn onClick={() => downloadJson(`gestao3d_backup_${Date.now()}.json`, serializeBackup(state))}>
            <Download className="h-4 w-4" /> Exportar JSON
          </Btn>
          <Btn
            variant="outline"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(serializeBackup(state));
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              } catch {
                /* ignore */
              }
            }}
          >
            <Copy className="h-4 w-4" /> {copied ? "Copiado!" : "Copiar para Clipboard"}
          </Btn>
          <Btn variant="danger" onClick={() => { if (confirm("Apagar tudo e voltar aos dados iniciais?")) reset(); }}>
            Resetar dados
          </Btn>
        </div>
        <div className="mt-4 space-y-2">
          <Field label="Restaurar backup por texto">
            <Textarea value={restoreText} onChange={(e) => setRestoreText(e.target.value)} rows={4} placeholder="Cole aqui o JSON exportado" />
          </Field>
          <Btn
            variant="outline"
            onClick={() => {
              const parsed = parseBackup(restoreText);
              if (!parsed) return alert("Backup inválido (cabeçalho ausente).");
              replaceAll(parsed);
              setRestoreText("");
              alert("Backup restaurado.");
            }}
          >
            <Upload className="h-4 w-4" /> Restaurar
          </Btn>
        </div>
      </Card>

      <Card>
        <h3 className="mb-3 text-sm font-semibold text-white/80">Operacional</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Custo do kWh (R$)">
            <Input type="number" step="0.01" value={brand.kwhPrice} onChange={(e) => updateBrand({ kwhPrice: Number(e.target.value) })} />
          </Field>
          <Field label="Valor da sua hora (R$)">
            <Input type="number" step="0.01" value={brand.hourlyLabor} onChange={(e) => updateBrand({ hourlyLabor: Number(e.target.value) })} />
          </Field>
        </div>
      </Card>

      <Card>
        <h3 className="mb-2 text-sm font-semibold text-white/80">Atualização APK (Android WebView)</h3>
        <p className="mb-3 text-xs text-white/40">
          Cole o link de download. Links do Dropbox com <code>?dl=0</code> são convertidos automaticamente para <code>?dl=1</code>.
        </p>
        <div className="flex gap-2">
          <Input value={apkUrl} onChange={(e) => setApkUrl(e.target.value)} placeholder="https://www.dropbox.com/.../app.apk?dl=0" />
          <Btn
            onClick={() => {
              if (!apkUrl) return;
              const url = normalizeDropbox(apkUrl);
              window.open(url, "_blank");
            }}
          >
            Baixar
          </Btn>
        </div>
      </Card>
    </div>
  );
}