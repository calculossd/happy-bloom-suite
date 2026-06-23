// @ts-nocheck
import { useEffect } from 'react';

const INTERVAL_MS = 6 * 60 * 60 * 1000; // 6h
const LAST_KEY = 'lov_auto_backup_last';

async function collectBackup() {
  const data: any = {
    exportedAt: new Date().toISOString(),
    version: 1,
    localStorage: {} as Record<string, string>,
    catalog: { models: [] as any[] },
  };
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      data.localStorage[k] = localStorage.getItem(k) ?? '';
    }
  } catch {}
  try {
    const { listModels } = await import('@/lib/catalog-db');
    data.catalog.models = await listModels();
  } catch {}
  return data;
}

function downloadJson(obj: any) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  a.href = url;
  a.download = `imprimetrics-backup-${ts}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function runBackupNow() {
  const data = await collectBackup();
  downloadJson(data);
  try { localStorage.setItem(LAST_KEY, String(Date.now())); } catch {}
}

export function useAutoBackup() {
  useEffect(() => {
    let timer: any;
    const tick = async () => {
      try {
        const last = Number(localStorage.getItem(LAST_KEY) || '0');
        if (!last || Date.now() - last >= INTERVAL_MS) {
          await runBackupNow();
        }
      } catch {}
    };
    // first check shortly after mount (avoids blocking initial render)
    const initial = setTimeout(tick, 30_000);
    timer = setInterval(tick, 15 * 60 * 1000); // re-check every 15min
    return () => { clearTimeout(initial); clearInterval(timer); };
  }, []);
}