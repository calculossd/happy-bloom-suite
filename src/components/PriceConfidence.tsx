import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ShieldCheck, AlertTriangle, Database, Check, Edit3, Loader2 } from 'lucide-react';

type Platform = 'shopee' | 'mercadolivre' | 'amazon';

interface Props {
  term: string;
  platform: Platform;
  referencePrice: number;
}

interface Obs {
  id: string;
  price: number;
  source: string;
  confidence: number;
  created_at: string;
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function PriceConfidence({ term, platform, referencePrice }: Props) {
  const normalized = normalize(term);
  const [obs, setObs] = useState<Obs[]>([]);
  const [correction, setCorrection] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string>(String(referencePrice));

  const load = async () => {
    setLoading(true);
    const [{ data: obsData }, { data: { user } }] = await Promise.all([
      supabase
        .from('price_observations')
        .select('id,price,source,confidence,created_at')
        .eq('normalized_term', normalized)
        .eq('platform', platform)
        .order('created_at', { ascending: false })
        .limit(20),
      supabase.auth.getUser(),
    ]);
    setObs((obsData as Obs[]) || []);
    setAuthed(!!user);
    if (user) {
      const { data: corr } = await supabase
        .from('price_corrections')
        .select('corrected_price')
        .eq('normalized_term', normalized)
        .eq('platform', platform)
        .eq('user_id', user.id)
        .maybeSingle();
      setCorrection(corr ? Number(corr.corrected_price) : null);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    setDraft(String(referencePrice));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalized, platform]);

  // Confidence calculation
  const prices = obs.map(o => o.price);
  const n = prices.length;
  const mean = n ? prices.reduce((a, b) => a + b, 0) / n : referencePrice;
  const variance = n ? prices.reduce((a, b) => a + (b - mean) ** 2, 0) / n : 0;
  const cv = mean > 0 ? Math.sqrt(variance) / mean : 1; // coef. variação
  const freshDays = n
    ? (Date.now() - new Date(obs[0].created_at).getTime()) / 86400000
    : 999;

  // score 0..100
  let score = 0;
  if (n > 0) {
    const sampleScore = Math.min(50, n * 10);
    const stabilityScore = Math.max(0, 35 - cv * 100); // cv 0 → 35, cv 0.35 → 0
    const freshScore = Math.max(0, 15 - freshDays); // <15 dias
    score = Math.round(sampleScore + stabilityScore + freshScore);
  }
  score = Math.min(100, score);

  const tier =
    score >= 70 ? { label: 'Alta', color: 'emerald', Icon: ShieldCheck }
    : score >= 40 ? { label: 'Média', color: 'amber', Icon: Database }
    : { label: 'Baixa', color: 'rose', Icon: AlertTriangle };

  const recordObservation = async () => {
    if (!authed) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('price_observations').insert({
        query_term: term,
        normalized_term: normalized,
        platform,
        price: referencePrice,
        source: 'user_search',
        confidence: 0.6,
        user_id: user.id,
      });
      await load();
    }
    setSaving(false);
  };

  const saveCorrection = async () => {
    if (!authed) return;
    const value = parseFloat(draft);
    if (!isFinite(value) || value <= 0) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('price_corrections').upsert({
        user_id: user.id,
        normalized_term: normalized,
        platform,
        corrected_price: value,
      }, { onConflict: 'user_id,normalized_term,platform' });
      await supabase.from('price_observations').insert({
        query_term: term,
        normalized_term: normalized,
        platform,
        price: value,
        source: 'manual_correction',
        confidence: 0.95,
        user_id: user.id,
      });
      setEditing(false);
      await load();
    }
    setSaving(false);
  };

  return (
    <div className="bg-[#05080F]/60 rounded-2xl p-5 border border-[#121826] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-300 font-bold uppercase tracking-wider">
          <tier.Icon className={`w-4.5 h-4.5 text-${tier.color}-400`} />
          <span>Robustez do preço</span>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-${tier.color}-500/10 text-${tier.color}-300 border border-${tier.color}-500/30`}>
          Confiança {tier.label} · {score}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-xs text-slate-500"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Carregando histórico…</div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-[#0e1322]/80 border border-[#1e2943]/40 rounded-lg py-2">
              <div className="text-[10px] uppercase text-slate-500 font-bold">Amostras</div>
              <div className="text-sm font-mono font-bold text-slate-200">{n}</div>
            </div>
            <div className="bg-[#0e1322]/80 border border-[#1e2943]/40 rounded-lg py-2">
              <div className="text-[10px] uppercase text-slate-500 font-bold">Média</div>
              <div className="text-sm font-mono font-bold text-slate-200">R$ {mean.toFixed(2)}</div>
            </div>
            <div className="bg-[#0e1322]/80 border border-[#1e2943]/40 rounded-lg py-2">
              <div className="text-[10px] uppercase text-slate-500 font-bold">Variação</div>
              <div className="text-sm font-mono font-bold text-slate-200">{(cv * 100).toFixed(1)}%</div>
            </div>
          </div>

          {correction !== null && (
            <div className="text-xs text-emerald-300 bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-3 py-2 flex items-center gap-2">
              <Check className="w-3.5 h-3.5" /> Sua correção fixa: <strong>R$ {correction.toFixed(2)}</strong>
            </div>
          )}

          {obs.length > 0 && (
            <div className="space-y-1 max-h-32 overflow-auto">
              {obs.slice(0, 6).map(o => (
                <div key={o.id} className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-2 py-1 rounded bg-[#0a0f1a]">
                  <span>{new Date(o.created_at).toLocaleDateString('pt-BR')}</span>
                  <span className="text-slate-500">{o.source}</span>
                  <span className="text-orange-300 font-bold">R$ {Number(o.price).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          {!authed && (
            <div className="text-[11px] text-amber-300/80 bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-2">
              Faça login para registrar observações e correções manuais — assim seu histórico melhora a confiança do preço.
            </div>
          )}

          {authed && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={recordObservation}
                disabled={saving}
                className="text-[11px] px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-300 hover:bg-orange-500/20 transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <Database className="w-3 h-3" /> Registrar este preço
              </button>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="text-[11px] px-3 py-1.5 rounded-lg bg-slate-500/10 border border-slate-500/30 text-slate-300 hover:bg-slate-500/20 transition flex items-center gap-1.5"
                >
                  <Edit3 className="w-3 h-3" /> Corrigir manualmente
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    className="w-24 text-[11px] px-2 py-1.5 rounded-lg bg-[#0a0f1a] border border-[#1e2943] text-slate-200 font-mono"
                  />
                  <button onClick={saveCorrection} disabled={saving} className="text-[11px] px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 disabled:opacity-50">
                    Salvar
                  </button>
                  <button onClick={() => setEditing(false)} className="text-[11px] px-2 py-1.5 text-slate-400">cancelar</button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
