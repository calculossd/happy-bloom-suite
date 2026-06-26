// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import {
  Receipt, FileText, Calendar, DollarSign, Wallet, FileBarChart2,
  Plus, Trash2, CheckCircle2, AlertTriangle, Download, Upload, Search, ArrowRight,
  Building2, Banknote, ExternalLink, Landmark, ScrollText, Globe,
} from 'lucide-react';
import { toast } from 'sonner';
import { Kpi, SectionTitle } from './DashboardShell';

/* ---------- storage helpers ---------- */
const KEY = 'contabilidade_mei_v1';
type Activity = 'comercio' | 'servico' | 'misto';
const DAS_2026: Record<Activity, number> = { comercio: 76.9, servico: 80.9, misto: 81.9 };
const ANNUAL_LIMIT = 81000;

type Nota = {
  id: string; type: 'emitida' | 'recebida'; number: string; issue_date: string;
  party: string; description: string; value: number; access_key?: string; file_url?: string;
  is_service?: boolean; municipio_prestador?: string;
};
type Receita = { year: number; month: number; total_sem_nota: number };
type DasPag = {
  id: string; reference: string /* YYYY-MM */; due_date: string;
  value: number; status: 'pendente' | 'pago'; payment_date?: string; comprovante?: string;
};
type Despesa = {
  id: string; date: string; category: string; description: string;
  value: number; comprovante?: string;
};
type State = {
  config: { activity: Activity; das_value: number };
  notas: Nota[];
  receitas: Receita[];
  das: DasPag[];
  despesas: Despesa[];
  empresa?: Empresa;
};

export type Empresa = {
  cnpj: string; nome_fantasia: string; razao_social: string;
  atividade_principal: string; endereco: string; cidade: string; uf: string;
  cep: string; telefone: string; email: string; data_abertura: string;
  updated_at?: string;
};
const defaultEmpresa = (): Empresa => ({
  cnpj: '', nome_fantasia: '', razao_social: '', atividade_principal: '',
  endereco: '', cidade: 'Sorocaba', uf: 'SP', cep: '', telefone: '', email: '', data_abertura: '',
});

const LINKS_GOVERNO: { descricao: string; url: string; icone: React.ComponentType<{ className?: string }> }[] = [
  { descricao: 'Portal do Empreendedor MEI', url: 'https://www.gov.br/mei/pt-br', icone: Building2 },
  { descricao: 'PGMEI (Declaração Anual)', url: 'https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/servicos-para-mei/declaracao-anual-do-mei', icone: FileText },
  { descricao: 'Pagar DAS (Simples Nacional)', url: 'https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/', icone: Banknote },
  { descricao: 'Emitir NFS-e (Nota Sorocaba)', url: 'https://nfse.sorocaba.sp.gov.br/', icone: Receipt },
  { descricao: 'Prefeitura de Sorocaba – MEI', url: 'https://www.sorocaba.sp.gov.br/', icone: Landmark },
  { descricao: 'SEFAZ SP – Consulta CNPJ', url: 'https://www.sefaz.sp.gov.br/', icone: ScrollText },
  { descricao: 'Receita Federal – e-CAC', url: 'https://cav.receita.fazenda.gov.br/', icone: Globe },
  { descricao: 'INSS – Consulta Débitos', url: 'https://www.gov.br/inss/pt-br', icone: Landmark },
];

const defaultState = (): State => ({
  config: { activity: 'comercio', das_value: DAS_2026.comercio },
  notas: [], receitas: [], das: [], despesas: [],
});

const loadState = (): State => {
  if (typeof window === 'undefined') return defaultState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch { return defaultState(); }
};
const saveState = (s: State) => {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
};

const uid = () => Math.random().toString(36).slice(2, 10);
const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = rej;
    r.readAsDataURL(file);
  });

/* ---------- shared UI ---------- */
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-5 ${className}`}>{children}</div>
);
const Btn: React.FC<any> = ({ children, className = '', tone = 'lime', ...p }) => {
  const tones: any = {
    lime: 'bg-[#b7ff00] text-black hover:scale-[1.03]',
    ghost: 'bg-white/5 text-white hover:bg-white/10 border border-white/10',
    danger: 'bg-red-500/15 text-red-300 hover:bg-red-500/25 border border-red-500/30',
    gold: 'bg-[#D4A017] text-black hover:scale-[1.03]',
  };
  return (
    <button {...p} className={`px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition ${tones[tone]} ${className}`}>
      {children}
    </button>
  );
};
const Input: React.FC<any> = (p) => (
  <input {...p} className={`w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#b7ff00]/50 ${p.className||''}`} />
);
const Select: React.FC<any> = ({ children, ...p }) => (
  <select {...p} className={`w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#b7ff00]/50 ${p.className||''}`}>{children}</select>
);
const Modal: React.FC<{ open: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg bg-[#0a0c0a] border border-white/10 rounded-2xl p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">{title}</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

/* ---------- main ---------- */
const SUBS = [
  { id: 'dash',   label: 'Dashboard',         icon: FileBarChart2 },
  { id: 'empresa',label: 'Empresa',           icon: Building2 },
  { id: 'notas',  label: 'Notas Fiscais',     icon: Receipt },
  { id: 'rec',    label: 'Receitas Mensais',  icon: Calendar },
  { id: 'das',    label: 'DAS',               icon: DollarSign },
  { id: 'desp',   label: 'Despesas',          icon: Wallet },
  { id: 'dasn',   label: 'Declaração Anual',  icon: FileText },
] as const;

export const ContabilidadeTab: React.FC = () => {
  const [state, setState] = useState<State>(() => loadState());
  const [sub, setSub] = useState<typeof SUBS[number]['id']>('dash');
  useEffect(() => { saveState(state); }, [state]);

  const update = (fn: (s: State) => State) => setState(s => fn(structuredClone(s)));

  return (
    <div className="w-full space-y-6">
      <SectionTitle icon={FileBarChart2} title="Contabilidade MEI" status="Local" />

      {/* sub-nav */}
      <div className="flex flex-wrap gap-2">
        {SUBS.map(s => {
          const Icon = s.icon;
          const active = sub === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSub(s.id)}
              className={`px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 transition ${
                active
                  ? 'bg-[#b7ff00] text-black shadow-[0_0_20px_rgba(183,255,0,0.3)]'
                  : 'bg-white/[0.04] text-white/70 border border-white/10 hover:bg-white/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />{s.label}
            </button>
          );
        })}
      </div>

      {sub === 'dash' && <DashboardSub state={state} setSub={setSub} />}
      {sub === 'empresa' && <EmpresaSub state={state} update={update} />}
      {sub === 'notas' && <NotasSub state={state} update={update} />}
      {sub === 'rec' && <ReceitasSub state={state} update={update} />}
      {sub === 'das' && <DasSub state={state} update={update} />}
      {sub === 'desp' && <DespesasSub state={state} update={update} />}
      {sub === 'dasn' && <DasnSub state={state} />}
    </div>
  );
};

export default ContabilidadeTab;

/* ---------- helpers for revenue ---------- */
function monthTotals(state: State, year: number) {
  return Array.from({ length: 12 }, (_, m) => {
    const month = m + 1;
    const notas = state.notas
      .filter(n => n.type === 'emitida' && new Date(n.issue_date).getFullYear() === year && new Date(n.issue_date).getMonth() + 1 === month)
      .reduce((s, n) => s + Number(n.value || 0), 0);
    const rec = state.receitas.find(r => r.year === year && r.month === month);
    const sem = rec?.total_sem_nota || 0;
    return { month, notas, sem, total: notas + sem };
  });
}

/* ---------- DASHBOARD ---------- */
const DashboardSub: React.FC<{ state: State; setSub: (s: any) => void }> = ({ state, setSub }) => {
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  const totals = monthTotals(state, year);
  const accum = totals.slice(0, month).reduce((s, t) => s + t.total, 0);
  const pct = Math.min(100, (accum / ANNUAL_LIMIT) * 100);
  const nextDas = state.das.filter(d => d.status === 'pendente').sort((a, b) => a.due_date.localeCompare(b.due_date))[0];
  const despMes = state.despesas
    .filter(d => new Date(d.date).getFullYear() === year && new Date(d.date).getMonth() + 1 === month)
    .reduce((s, d) => s + Number(d.value || 0), 0);

  const max = Math.max(1, ...totals.map(t => t.total));

  const notasMes = state.notas.filter(n => n.type === 'emitida' && new Date(n.issue_date).getFullYear() === year && new Date(n.issue_date).getMonth() + 1 === month);
  const notasMesValor = notasMes.reduce((s, n) => s + Number(n.value || 0), 0);

  const empresa = state.empresa;
  const empresaIncompleta = !empresa || !empresa.cnpj || empresa.cnpj.replace(/\D/g, '').length !== 14 || !empresa.razao_social;
  const nomeFantasia = empresa?.nome_fantasia?.trim() || empresa?.razao_social?.trim() || 'Empresa MEI';

  return (
    <div className="space-y-5">
      {/* Welcome */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0f1a10] via-[#0a0c0a] to-[#0a0c0a] p-5">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#b7ff00]/10 blur-3xl pointer-events-none" />
        <div className="relative flex items-center justify-between flex-wrap gap-3">
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#b7ff00] font-bold">Bem-vindo</span>
            <h2 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight mt-1">{nomeFantasia}</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Painel contábil · {MESES[month - 1]} / {year}</p>
          </div>
          {empresa?.cnpj && (
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">CNPJ</span>
              <div className="text-sm text-white font-bold tabular-nums">{empresa.cnpj}</div>
            </div>
          )}
        </div>
      </div>

      {empresaIncompleta && (
        <button
          onClick={() => setSub('empresa')}
          className="w-full flex items-center gap-3 p-4 rounded-2xl border border-orange-500/40 bg-orange-500/10 hover:bg-orange-500/15 transition text-left"
        >
          <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0" />
          <div className="flex-1">
            <div className="text-sm font-bold text-orange-200">Complete os dados da empresa</div>
            <div className="text-[11px] text-orange-200/70">CNPJ e razão social são necessários para emitir notas e gerar a DASN.</div>
          </div>
          <ArrowRight className="w-4 h-4 text-orange-300" />
        </button>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi icon={DollarSign} label="DAS Mensal" value={brl(state.config.das_value)} sub={state.config.activity.toUpperCase()} tone="gold" />
        <Kpi icon={Calendar} label="Próximo DAS" value={nextDas ? nextDas.reference : '—'} sub={nextDas ? `Venc. ${new Date(nextDas.due_date).toLocaleDateString('pt-BR')}` : 'Sem pendência'} tone="orange" />
        <Kpi icon={FileBarChart2} label="Faturamento Ano" value={brl(accum)} sub={`${pct.toFixed(1)}% do limite`} tone={pct > 80 ? 'orange' : 'lime'} />
        <Kpi icon={Receipt} label="Notas no Mês" value={`${notasMes.length}`} sub={brl(notasMesValor)} tone="emerald" />
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Limite anual MEI</span>
          <span className="text-[11px] text-white font-bold tabular-nums">{brl(accum)} / {brl(ANNUAL_LIMIT)}</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: pct > 80 ? '#f97316' : '#b7ff00' }}
          />
        </div>
        {pct > 80 && (
          <div className="mt-3 flex items-center gap-2 text-orange-300 text-xs">
            <AlertTriangle className="w-4 h-4" /> Atenção: você está acima de 80% do limite anual de R$ 81.000.
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Faturamento {year}</h4>
          <div className="flex items-end gap-1.5 h-32">
            {totals.map(t => (
              <div key={t.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-gradient-to-t from-[#b7ff00] to-[#D4A017] rounded-t" style={{ height: `${(t.total / max) * 100}%`, minHeight: t.total ? '4px' : '0' }} />
                <span className="text-[9px] text-zinc-500 font-bold">{MESES[t.month - 1]}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Ações rápidas</h4>
          <div className="flex flex-col gap-2">
            <Btn onClick={() => setSub('notas')}><Plus className="inline w-3 h-3 mr-1" /> Nota Fiscal</Btn>
            <Btn tone="ghost" onClick={() => setSub('rec')}><Plus className="inline w-3 h-3 mr-1" /> Lançar Receita</Btn>
            <Btn tone="gold" onClick={() => setSub('das')}><DollarSign className="inline w-3 h-3 mr-1" /> Pagar DAS</Btn>
            <Btn tone="ghost" onClick={() => setSub('dasn')}><FileText className="inline w-3 h-3 mr-1" /> Declaração</Btn>
          </div>
        </Card>
      </div>

      {/* Links úteis */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#D4A017]" />
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">Links Úteis</h4>
          </div>
          <button onClick={() => setSub('empresa')} className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-[#b7ff00] flex items-center gap-1">
            Ver todos <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {LINKS_GOVERNO.slice(0, 4).map((l, i) => {
            const Icon = l.icone;
            return (
              <a
                key={i}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.04] border border-white/10 hover:border-[#b7ff00]/40 transition"
              >
                <Icon className="w-4 h-4 text-[#D4A017] shrink-0" />
                <span className="text-[11px] font-bold text-white truncate flex-1">{l.descricao}</span>
                <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-[#b7ff00] transition" />
              </a>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

/* ---------- NOTAS ---------- */
const NotasSub: React.FC<{ state: State; update: (fn: (s: State) => State) => void }> = ({ state, update }) => {
  const [type, setType] = useState<'emitida' | 'recebida'>('emitida');
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const defaultForm = () => ({
    number: '', issue_date: new Date().toISOString().slice(0, 10),
    party: '', description: '', value: '', access_key: '',
    is_service: false, municipio_prestador: state.empresa?.cidade || 'Sorocaba',
  });
  const [form, setForm] = useState<any>(defaultForm);

  const list = state.notas.filter(n => n.type === type && (q === '' || n.party.toLowerCase().includes(q.toLowerCase()) || n.number.includes(q)));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.party.trim()) { toast.error('Informe o cliente/fornecedor'); return; }
    const val = Number(form.value);
    if (!val || val <= 0) { toast.error('Valor inválido'); return; }
    const fileInput = (e.target as HTMLFormElement).elements.namedItem('file') as HTMLInputElement;
    let file_url: string | undefined;
    if (fileInput?.files?.[0]) file_url = await fileToDataUrl(fileInput.files[0]);
    const nota: Nota = { id: uid(), type, ...form, value: val, file_url };
    update(s => ({ ...s, notas: [nota, ...s.notas] }));
    setOpen(false);
    setForm(defaultForm());
    toast.success(`Nota ${type === 'emitida' ? 'emitida' : 'recebida'} salva`);
  };

  const remove = (id: string) => {
    if (!confirm('Excluir esta nota fiscal?')) return;
    update(s => ({ ...s, notas: s.notas.filter(n => n.id !== id) }));
    toast.success('Nota excluída — receita do mês recalculada');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(['emitida', 'recebida'] as const).map(t => (
            <button key={t} onClick={() => setType(t)} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest ${type === t ? 'bg-white/10 text-white border border-white/20' : 'bg-white/[0.03] text-white/60 border border-white/10'}`}>
              {t === 'emitida' ? 'Emitidas' : 'Recebidas'} ({state.notas.filter(n => n.type === t).length})
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-500" />
            <Input placeholder="Buscar..." value={q} onChange={(e: any) => setQ(e.target.value)} className="pl-8 w-56" />
          </div>
          <Btn onClick={() => setOpen(true)}><Plus className="inline w-3 h-3 mr-1" /> Nova Nota {type === 'emitida' ? 'Emitida' : 'Recebida'}</Btn>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        {list.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 text-sm">
            <Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" />
            Nenhuma nota {type === 'emitida' ? 'emitida' : 'recebida'}. Cadastre a primeira!
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03] text-[10px] uppercase tracking-widest text-zinc-400">
              <tr>
                <th className="text-left p-3">Número</th>
                <th className="text-left p-3">Data</th>
                <th className="text-left p-3">{type === 'emitida' ? 'Cliente' : 'Fornecedor'}</th>
                <th className="text-right p-3">Valor</th>
                <th className="text-left p-3">Chave</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {list.map(n => (
                <tr key={n.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="p-3 text-white font-mono text-xs">{n.number || '—'}</td>
                  <td className="p-3 text-zinc-300">{new Date(n.issue_date).toLocaleDateString('pt-BR')}</td>
                  <td className="p-3 text-zinc-200">{n.party}</td>
                  <td className="p-3 text-right text-[#b7ff00] font-bold tabular-nums">{brl(n.value)}</td>
                  <td className="p-3 text-zinc-500 font-mono text-[10px]">{n.access_key ? n.access_key.slice(0, 12) + '…' : '—'}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {n.file_url && <a href={n.file_url} download className="p-1.5 text-zinc-400 hover:text-white"><Download className="w-3.5 h-3.5" /></a>}
                      <button onClick={() => remove(n.id)} className="p-1.5 text-red-400 hover:text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={`Nova Nota ${type === 'emitida' ? 'Emitida' : 'Recebida'}`}>
        <form onSubmit={save} className="space-y-3">
          {type === 'emitida' && (
            <div className="rounded-lg border border-[#D4A017]/30 bg-[#D4A017]/10 p-3 text-[11px] text-[#f3d77a] leading-relaxed">
              <div className="flex items-start gap-2">
                <Receipt className="w-4 h-4 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <strong className="text-white">Serviços (ISS):</strong> emita a NFS-e no portal da Prefeitura de Sorocaba e cole a chave aqui.
                </div>
              </div>
              <a
                href="https://nfse.sorocaba.sp.gov.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#D4A017] text-black text-[10px] font-bold uppercase tracking-widest hover:scale-[1.03] transition"
              >
                <ExternalLink className="w-3 h-3" /> Emitir NFS-e Sorocaba
              </a>
            </div>
          )}
          {type === 'emitida' && (
            <label className="flex items-center gap-2 text-[11px] text-zinc-300">
              <input
                type="checkbox"
                checked={!!form.is_service}
                onChange={(e) => setForm({ ...form, is_service: e.target.checked })}
                className="accent-[#b7ff00]"
              />
              Nota de <strong className="text-white">serviço</strong> (NFS-e) — não de produto
            </label>
          )}
          <div className="grid grid-cols-2 gap-3">
            {type === 'emitida' && <Input placeholder="Número" value={form.number} onChange={(e: any) => setForm({ ...form, number: e.target.value })} />}
            <Input type="date" value={form.issue_date} onChange={(e: any) => setForm({ ...form, issue_date: e.target.value })} className={type === 'recebida' ? 'col-span-2' : ''} />
          </div>
          <Input placeholder={type === 'emitida' ? 'Cliente' : 'Fornecedor'} required value={form.party} onChange={(e: any) => setForm({ ...form, party: e.target.value })} />
          <Input placeholder="Descrição" value={form.description} onChange={(e: any) => setForm({ ...form, description: e.target.value })} />
          <Input type="number" step="0.01" placeholder="Valor (R$)" required value={form.value} onChange={(e: any) => setForm({ ...form, value: e.target.value })} />
          {type === 'emitida' && <Input placeholder="Chave de acesso (opcional)" value={form.access_key} onChange={(e: any) => setForm({ ...form, access_key: e.target.value })} />}
          {type === 'emitida' && form.is_service && (
            <Input
              placeholder="Município prestador"
              value={form.municipio_prestador}
              onChange={(e: any) => setForm({ ...form, municipio_prestador: e.target.value })}
            />
          )}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold flex items-center gap-1 mb-1"><Upload className="w-3 h-3" /> Arquivo PDF/XML</label>
            <input name="file" type="file" accept=".pdf,.xml,image/*" className="text-xs text-zinc-300 w-full" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Btn tone="ghost" type="button" onClick={() => setOpen(false)}>Cancelar</Btn>
            <Btn type="submit">Salvar</Btn>
          </div>
        </form>
      </Modal>
    </div>
  );
};

/* ---------- RECEITAS ---------- */
const ReceitasSub: React.FC<{ state: State; update: (fn: (s: State) => State) => void }> = ({ state, update }) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const totals = monthTotals(state, year);
  const totalAno = totals.reduce((s, t) => s + t.total, 0);
  const monthlyLimit = 6750;

  const setSem = (month: number, val: number) => {
    update(s => {
      const i = s.receitas.findIndex(r => r.year === year && r.month === month);
      if (i >= 0) s.receitas[i].total_sem_nota = val;
      else s.receitas.push({ year, month, total_sem_nota: val });
      return s;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select value={year} onChange={(e: any) => setYear(Number(e.target.value))} className="w-32">
          {[year - 1, year, year + 1].map(y => <option key={y} value={y}>{y}</option>)}
        </Select>
        <div className="text-sm text-white">
          Total {year}: <span className="font-bold text-[#b7ff00] tabular-nums">{brl(totalAno)}</span>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03] text-[10px] uppercase tracking-widest text-zinc-400">
            <tr>
              <th className="text-left p-3">Mês</th>
              <th className="text-right p-3">Notas Emitidas</th>
              <th className="text-right p-3">Vendas s/ Nota</th>
              <th className="text-right p-3">Receita Bruta</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {totals.map(t => {
              const over = t.total > monthlyLimit;
              return (
                <tr key={t.month} className="border-t border-white/5">
                  <td className="p-3 text-white font-bold">{MESES[t.month - 1]}</td>
                  <td className="p-3 text-right text-zinc-300 tabular-nums">{brl(t.notas)}</td>
                  <td className="p-3 text-right">
                    <input
                      type="number" step="0.01" defaultValue={t.sem || ''}
                      onBlur={(e) => setSem(t.month, Number(e.target.value) || 0)}
                      className="w-28 bg-white/[0.04] border border-white/10 rounded px-2 py-1 text-xs text-right text-white tabular-nums"
                    />
                  </td>
                  <td className={`p-3 text-right font-bold tabular-nums ${over ? 'text-orange-300' : 'text-[#b7ff00]'}`}>{brl(t.total)}</td>
                  <td className="p-3 text-right">{over && <AlertTriangle className="w-3.5 h-3.5 text-orange-400 inline" />}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
      <p className="text-[10px] text-zinc-500">Alerta laranja: mês acima de R$ 6.750 (limite proporcional MEI).</p>
    </div>
  );
};

/* ---------- DAS ---------- */
const DasSub: React.FC<{ state: State; update: (fn: (s: State) => State) => void }> = ({ state, update }) => {
  const [payOpen, setPayOpen] = useState<string | null>(null);
  const [payForm, setPayForm] = useState({ payment_date: new Date().toISOString().slice(0, 10) });

  const setActivity = (act: Activity) => update(s => ({ ...s, config: { ...s.config, activity: act, das_value: DAS_2026[act] } }));
  const setValue = (v: number) => update(s => ({ ...s, config: { ...s.config, das_value: v } }));

  const addNext = () => {
    update(s => {
      const last = [...s.das].sort((a, b) => b.reference.localeCompare(a.reference))[0];
      const base = last ? new Date(last.reference + '-01') : new Date();
      base.setMonth(base.getMonth() + (last ? 1 : 0));
      const ref = `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}`;
      if (s.das.find(d => d.reference === ref)) return s;
      const due = new Date(base.getFullYear(), base.getMonth() + 1, 20);
      s.das.push({ id: uid(), reference: ref, due_date: due.toISOString().slice(0, 10), value: s.config.das_value, status: 'pendente' });
      return s;
    });
  };

  const markPaid = async (id: string, e: React.FormEvent) => {
    e.preventDefault();
    const fi = (e.target as HTMLFormElement).elements.namedItem('comprovante') as HTMLInputElement;
    let comprovante: string | undefined;
    if (fi?.files?.[0]) comprovante = await fileToDataUrl(fi.files[0]);
    update(s => {
      const d = s.das.find(x => x.id === id);
      if (d) { d.status = 'pago'; d.payment_date = payForm.payment_date; if (comprovante) d.comprovante = comprovante; }
      // auto-create next
      const base = new Date(d!.reference + '-01');
      base.setMonth(base.getMonth() + 1);
      const ref = `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}`;
      if (!s.das.find(x => x.reference === ref)) {
        const due = new Date(base.getFullYear(), base.getMonth() + 1, 20);
        s.das.push({ id: uid(), reference: ref, due_date: due.toISOString().slice(0, 10), value: s.config.das_value, status: 'pendente' });
      }
      return s;
    });
    setPayOpen(null);
  };

  const remove = (id: string) => {
    if (!confirm('Excluir este DAS?')) return;
    update(s => ({ ...s, das: s.das.filter(d => d.id !== id) }));
  };

  const sorted = [...state.das].sort((a, b) => b.reference.localeCompare(a.reference));

  return (
    <div className="space-y-4">
      <Card>
        <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Configuração MEI</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Atividade</label>
            <Select value={state.config.activity} onChange={(e: any) => setActivity(e.target.value)}>
              <option value="comercio">Comércio/Indústria</option>
              <option value="servico">Serviços</option>
              <option value="misto">Misto</option>
            </Select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">DAS Mensal (R$)</label>
            <Input type="number" step="0.01" value={state.config.das_value} onChange={(e: any) => setValue(Number(e.target.value))} />
          </div>
          <div className="flex items-end">
            <Btn onClick={addNext}><Plus className="inline w-3 h-3 mr-1" /> Gerar Próximo DAS</Btn>
          </div>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        {sorted.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 text-sm">
            Nenhum DAS gerado. Clique em "Gerar Próximo DAS" acima.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03] text-[10px] uppercase tracking-widest text-zinc-400">
              <tr>
                <th className="text-left p-3">Referência</th>
                <th className="text-left p-3">Vencimento</th>
                <th className="text-right p-3">Valor</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Pagamento</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {sorted.map(d => {
                const days = Math.ceil((new Date(d.due_date).getTime() - Date.now()) / 86400000);
                const urgent = d.status === 'pendente' && days <= 5;
                return (
                  <tr key={d.id} className="border-t border-white/5">
                    <td className="p-3 text-white font-bold">{d.reference}</td>
                    <td className="p-3 text-zinc-300">{new Date(d.due_date).toLocaleDateString('pt-BR')} {urgent && <span className="ml-2 px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 text-[9px] font-bold uppercase">Urgente</span>}</td>
                    <td className="p-3 text-right text-[#b7ff00] font-bold tabular-nums">{brl(d.value)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${d.status === 'pago' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-orange-500/20 text-orange-300'}`}>{d.status}</span>
                    </td>
                    <td className="p-3 text-zinc-400 text-xs">
                      {d.payment_date ? new Date(d.payment_date).toLocaleDateString('pt-BR') : '—'}
                      {d.comprovante && <a href={d.comprovante} download className="ml-2 text-zinc-300"><Download className="w-3 h-3 inline" /></a>}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {d.status === 'pendente' && <Btn className="!py-1 !px-2" onClick={() => setPayOpen(d.id)}><CheckCircle2 className="w-3 h-3 inline mr-1" />Pagar</Btn>}
                        <button onClick={() => remove(d.id)} className="p-1.5 text-red-400 hover:text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      <Modal open={!!payOpen} onClose={() => setPayOpen(null)} title="Registrar Pagamento DAS">
        {payOpen && (
          <form onSubmit={(e) => markPaid(payOpen, e)} className="space-y-3">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Data do pagamento</label>
              <Input type="date" value={payForm.payment_date} onChange={(e: any) => setPayForm({ payment_date: e.target.value })} required />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold flex items-center gap-1 mb-1"><Upload className="w-3 h-3" /> Comprovante</label>
              <input name="comprovante" type="file" accept=".pdf,image/*" className="text-xs text-zinc-300 w-full" />
            </div>
            <div className="flex justify-end gap-2">
              <Btn tone="ghost" type="button" onClick={() => setPayOpen(null)}>Cancelar</Btn>
              <Btn type="submit">Confirmar Pagamento</Btn>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

/* ---------- DESPESAS ---------- */
const CATEGORIAS = ['Material', 'Aluguel', 'Serviços', 'Filamento', 'Energia', 'Marketing', 'Outros'];
const DespesasSub: React.FC<{ state: State; update: (fn: (s: State) => State) => void }> = ({ state, update }) => {
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState('');
  const [form, setForm] = useState<any>({ date: new Date().toISOString().slice(0, 10), category: 'Material', description: '', value: '' });

  const list = state.despesas.filter(d => cat === '' || d.category === cat);
  const total = list.reduce((s, d) => s + Number(d.value || 0), 0);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const fi = (e.target as HTMLFormElement).elements.namedItem('comp') as HTMLInputElement;
    let comprovante: string | undefined;
    if (fi?.files?.[0]) comprovante = await fileToDataUrl(fi.files[0]);
    const d: Despesa = { id: uid(), ...form, value: Number(form.value) || 0, comprovante };
    update(s => ({ ...s, despesas: [d, ...s.despesas] }));
    setOpen(false);
    setForm({ date: new Date().toISOString().slice(0, 10), category: 'Material', description: '', value: '' });
  };
  const remove = (id: string) => { if (confirm('Excluir despesa?')) update(s => ({ ...s, despesas: s.despesas.filter(x => x.id !== id) })); };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select value={cat} onChange={(e: any) => setCat(e.target.value)} className="w-48">
          <option value="">Todas as categorias</option>
          {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
        </Select>
        <div className="flex items-center gap-3">
          <span className="text-sm text-white">Total: <span className="font-bold text-[#b7ff00] tabular-nums">{brl(total)}</span></span>
          <Btn onClick={() => setOpen(true)}><Plus className="inline w-3 h-3 mr-1" /> Nova Despesa</Btn>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        {list.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 text-sm">Nenhuma despesa registrada.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03] text-[10px] uppercase tracking-widest text-zinc-400">
              <tr>
                <th className="text-left p-3">Data</th>
                <th className="text-left p-3">Categoria</th>
                <th className="text-left p-3">Descrição</th>
                <th className="text-right p-3">Valor</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {list.map(d => (
                <tr key={d.id} className="border-t border-white/5">
                  <td className="p-3 text-zinc-300">{new Date(d.date).toLocaleDateString('pt-BR')}</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded bg-white/5 text-[10px] uppercase tracking-wider text-zinc-300">{d.category}</span></td>
                  <td className="p-3 text-white">{d.description}</td>
                  <td className="p-3 text-right text-orange-300 font-bold tabular-nums">{brl(d.value)}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {d.comprovante && <a href={d.comprovante} download className="p-1.5 text-zinc-400 hover:text-white"><Download className="w-3.5 h-3.5" /></a>}
                      <button onClick={() => remove(d.id)} className="p-1.5 text-red-400 hover:text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Nova Despesa">
        <form onSubmit={save} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input type="date" value={form.date} onChange={(e: any) => setForm({ ...form, date: e.target.value })} required />
            <Select value={form.category} onChange={(e: any) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>
          <Input placeholder="Descrição" required value={form.description} onChange={(e: any) => setForm({ ...form, description: e.target.value })} />
          <Input type="number" step="0.01" placeholder="Valor (R$)" required value={form.value} onChange={(e: any) => setForm({ ...form, value: e.target.value })} />
          <div>
            <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold flex items-center gap-1 mb-1"><Upload className="w-3 h-3" /> Comprovante</label>
            <input name="comp" type="file" accept=".pdf,image/*" className="text-xs text-zinc-300 w-full" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Btn tone="ghost" type="button" onClick={() => setOpen(false)}>Cancelar</Btn>
            <Btn type="submit">Salvar</Btn>
          </div>
        </form>
      </Modal>
    </div>
  );
};

/* ---------- DASN ---------- */
const DasnSub: React.FC<{ state: State }> = ({ state }) => {
  const [year, setYear] = useState(new Date().getFullYear() - 1);
  const totals = monthTotals(state, year);
  const total = totals.reduce((s, t) => s + t.total, 0);
  const over = total > ANNUAL_LIMIT;

  const exportTxt = () => {
    const lines = [`Declaração Anual MEI - ${year}`, '', ...totals.map(t => `${MESES[t.month - 1]}: ${brl(t.total)}`), '', `TOTAL: ${brl(total)}`];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `DASN_${year}.txt`; a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select value={year} onChange={(e: any) => setYear(Number(e.target.value))} className="w-32">
          {[year - 1, year, year + 1, year + 2].map(y => <option key={y} value={y}>{y}</option>)}
        </Select>
        <Btn tone="gold" onClick={exportTxt}><Download className="inline w-3 h-3 mr-1" /> Exportar Resumo DASN</Btn>
      </div>

      {over && (
        <Card className="border-orange-500/40">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-orange-300">Limite anual ultrapassado</h4>
              <p className="text-xs text-zinc-400 mt-1">Faturamento de {brl(total)} excede R$ 81.000. Considere migrar para Microempresa (ME) e consulte um contador.</p>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03] text-[10px] uppercase tracking-widest text-zinc-400">
            <tr>
              <th className="text-left p-3">Mês</th>
              <th className="text-right p-3">Receita Bruta</th>
            </tr>
          </thead>
          <tbody>
            {totals.map(t => (
              <tr key={t.month} className="border-t border-white/5">
                <td className="p-3 text-white">{MESES[t.month - 1]}</td>
                <td className="p-3 text-right text-[#b7ff00] font-bold tabular-nums">{brl(t.total)}</td>
              </tr>
            ))}
            <tr className="border-t-2 border-white/20 bg-white/[0.03]">
              <td className="p-3 text-white font-bold uppercase tracking-widest text-xs">Total Anual</td>
              <td className={`p-3 text-right font-extrabold text-lg tabular-nums ${over ? 'text-orange-300' : 'text-[#b7ff00]'}`}>{brl(total)}</td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
};

/* ---------- EMPRESA ---------- */
const maskCnpj = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
};
const maskCep = (v: string) => v.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');

const EmpresaSub: React.FC<{ state: State; update: (fn: (s: State) => State) => void }> = ({ state, update }) => {
  const [form, setForm] = useState<Empresa>(() => state.empresa ?? defaultEmpresa());
  const [saved, setSaved] = useState(false);
  const set = (k: keyof Empresa, v: string) => setForm(f => ({ ...f, [k]: v }));

  const cnpjDigits = form.cnpj.replace(/\D/g, '').length;
  const cnpjOk = cnpjDigits === 14;
  const emailOk = !form.email || /^\S+@\S+\.\S+$/.test(form.email);
  const canSave = cnpjOk && emailOk && form.razao_social.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    update(s => ({ ...s, empresa: { ...form, updated_at: new Date().toISOString() } }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Field: React.FC<{ label: string; children: React.ReactNode; hint?: string; full?: boolean }> = ({ label, children, hint, full }) => (
    <label className={`block space-y-1 ${full ? 'md:col-span-2' : ''}`}>
      <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">{label}</span>
      {children}
      {hint && <span className="text-[10px] text-red-400">{hint}</span>}
    </label>
  );

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#b7ff00]" />
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">Dados da Empresa</h3>
          </div>
          {state.empresa?.updated_at && (
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
              Atualizado {new Date(state.empresa.updated_at).toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="CNPJ *" hint={form.cnpj && !cnpjOk ? 'CNPJ deve ter 14 dígitos' : undefined}>
            <Input value={form.cnpj} onChange={(e: any) => set('cnpj', maskCnpj(e.target.value))} placeholder="00.000.000/0000-00" />
          </Field>
          <Field label="Data de Abertura">
            <Input type="date" value={form.data_abertura} onChange={(e: any) => set('data_abertura', e.target.value)} />
          </Field>
          <Field label="Razão Social *">
            <Input value={form.razao_social} onChange={(e: any) => set('razao_social', e.target.value)} placeholder="Nome registrado" />
          </Field>
          <Field label="Nome Fantasia">
            <Input value={form.nome_fantasia} onChange={(e: any) => set('nome_fantasia', e.target.value)} placeholder="Nome comercial" />
          </Field>
          <Field label="Atividade Principal (CNAE/MEI)" full>
            <Input value={form.atividade_principal} onChange={(e: any) => set('atividade_principal', e.target.value)} placeholder="Ex: Serviços de impressão 3D" />
          </Field>
          <Field label="Endereço" full>
            <Input value={form.endereco} onChange={(e: any) => set('endereco', e.target.value)} placeholder="Rua, número, bairro" />
          </Field>
          <Field label="Cidade">
            <Input value={form.cidade} onChange={(e: any) => set('cidade', e.target.value)} />
          </Field>
          <Field label="UF">
            <Input value={form.uf} onChange={(e: any) => set('uf', e.target.value.toUpperCase().slice(0, 2))} maxLength={2} />
          </Field>
          <Field label="CEP">
            <Input value={form.cep} onChange={(e: any) => set('cep', maskCep(e.target.value))} placeholder="00000-000" />
          </Field>
          <Field label="Telefone">
            <Input value={form.telefone} onChange={(e: any) => set('telefone', e.target.value)} placeholder="(00) 00000-0000" />
          </Field>
          <Field label="E-mail" hint={!emailOk ? 'E-mail inválido' : undefined} full>
            <Input type="email" value={form.email} onChange={(e: any) => set('email', e.target.value)} placeholder="contato@empresa.com" />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-2 mt-5">
          {saved && (
            <span className="text-[11px] text-[#b7ff00] font-bold uppercase tracking-widest flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Salvo
            </span>
          )}
          <Btn tone="lime" disabled={!canSave} onClick={save} className={!canSave ? 'opacity-50 cursor-not-allowed' : ''}>
            Salvar Dados
          </Btn>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4 text-[#D4A017]" />
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">Links do Governo</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {LINKS_GOVERNO.map((l, i) => {
            const Icon = l.icone;
            return (
              <a
                key={i}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-[#b7ff00]/40 hover:bg-white/[0.07] transition"
              >
                <div className="shrink-0 w-9 h-9 rounded-lg bg-[#D4A017]/15 border border-[#D4A017]/30 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-[#D4A017]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white truncate">{l.descricao}</div>
                  <div className="text-[10px] text-zinc-500 truncate">{l.url.replace(/^https?:\/\//, '')}</div>
                </div>
                <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-[#b7ff00] transition" />
              </a>
            );
          })}
        </div>
      </Card>
    </div>
  );
};