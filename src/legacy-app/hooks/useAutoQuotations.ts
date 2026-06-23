import { useEffect } from 'react';
import { getApiUrl } from '../utils/api';
import { safeStorage } from '../utils/storage';

const MATERIALS = ['PLA', 'PETG', 'TPU'] as const;
const EXPANDED_TERMS: Record<string, string> = {
  PLA: 'filamento pla 1.75mm 1kg impressora 3d comprar',
  PETG: 'filamento petg 1.75mm 1kg impressora 3d resistente',
  TPU: 'filamento flexivel tpu 1.75mm impressora 3d flex',
};

const getCurrentQuotationsPeriod = (): string => {
  const now = new Date();
  const hours = now.getHours();
  let period = 'noite';
  if (hours >= 6 && hours < 12) period = 'manha';
  else if (hours >= 12 && hours < 18) period = 'tarde';
  const dateStr = now.toISOString().split('T')[0];
  return `${dateStr}_${period}`;
};

const buildQuotationsUrl = (key: string, query?: string): string => {
  const params: string[] = [];
  if (key) params.push(`api_key=${encodeURIComponent(key.trim())}`);
  if (query) params.push(`q=${encodeURIComponent(query)}`);
  const qs = params.length ? `?${params.join('&')}` : '';
  return getApiUrl(`/api/quotations${qs}`);
};

const fetchQuotations = async (url: string, key: string, signal?: AbortSignal): Promise<any> => {
  const res = await fetch(url, {
    headers: { 'X-Custom-Serpapi-Key': key.trim() },
    signal,
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} (${res.statusText})`);
  }
  return res.json();
};

const fetchWithRetries = async (key: string, signal: AbortSignal, attempts = 3): Promise<any[] | null> => {
  for (let i = 0; i < attempts; i++) {
    if (signal.aborted) return null;
    try {
      const data = await fetchQuotations(buildQuotationsUrl(key), key, signal);
      if (Array.isArray(data) && data.length > 0) return data;
    } catch (err) {
      if ((err as any)?.name === 'AbortError') return null;
      console.warn(`[Auto-Quotes] Attempt ${i + 1} failed:`, err);
    }
    if (i < attempts - 1) {
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
  return null;
};

const optimizeOffers = async (data: any[], key: string, signal: AbortSignal): Promise<any[]> => {
  const cleaned = [...data];
  for (const mat of MATERIALS) {
    if (signal.aborted) return cleaned;
    let group = cleaned.find(
      (g: any) => g && String(g.type || '').toUpperCase() === mat,
    );
    if (!group) {
      group = { type: mat, offers: [] };
      cleaned.push(group);
    }
    if (group.offers && group.offers.length >= 5) continue;

    const queryStr = EXPANDED_TERMS[mat];
    try {
      const customData = await fetchQuotations(
        buildQuotationsUrl(key, queryStr),
        key,
        signal,
      );
      const newOffers = customData?.[0]?.offers;
      if (
        Array.isArray(newOffers) &&
        newOffers.length > 0 &&
        (!group.offers || newOffers.length > group.offers.length)
      ) {
        group.offers = newOffers;
        group.searchQuery = queryStr;
      }
    } catch (e) {
      if ((e as any)?.name === 'AbortError') return cleaned;
      console.warn(`[Auto-Quotes] Expanded query for ${mat} failed:`, e);
    }
    await new Promise((r) => setTimeout(r, 600));
  }
  return cleaned;
};

const persistQuotations = (data: any[], period: string): void => {
  safeStorage.setItem('bambuzau_cached_quotes', JSON.stringify(data));
  safeStorage.setItem('bambuzau_last_quotes_period', period);
  const now = new Date();
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const fullTimeStr = `${now.toLocaleDateString('pt-BR')} às ${timeStr}`;
  safeStorage.setItem('bambuzau_last_quotes_update', fullTimeStr);
  window.dispatchEvent(new CustomEvent('bambuzau_quotes_updated', { detail: data }));
};

const runAutoQuoteFetch = async (signal: AbortSignal): Promise<void> => {
  const currentPeriod = getCurrentQuotationsPeriod();
  const lastPeriod = safeStorage.getItem('bambuzau_last_quotes_period', '');
  if (currentPeriod === lastPeriod) return;

  const key = safeStorage.getItem('bambuzau_custom_serp_key', '');
  const data = await fetchWithRetries(key, signal);
  if (!data || signal.aborted) {
    console.warn('[Auto-Quotes] No valid data fetched.');
    return;
  }

  let finalData = data;
  try {
    finalData = await optimizeOffers(data, key, signal);
  } catch (err) {
    console.warn('[Auto-Quotes] Optimization failed:', err);
  }
  if (signal.aborted) return;
  persistQuotations(finalData, currentPeriod);
};

export const useAutoQuotations = (): void => {
  useEffect(() => {
    const controller = new AbortController();
    const initialTimer = setTimeout(() => {
      runAutoQuoteFetch(controller.signal);
    }, 4500);
    const periodicTimer = setInterval(() => {
      runAutoQuoteFetch(controller.signal);
    }, 15 * 60 * 1000);
    return () => {
      clearTimeout(initialTimer);
      clearInterval(periodicTimer);
      controller.abort();
    };
  }, []);
};