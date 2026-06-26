// @ts-nocheck
import { useEffect } from 'react';

const INTERVAL_MS = 6 * 60 * 60 * 1000; // 6h
const LAST_KEY = 'lov_auto_backup_last';
const HANDLE_DB = 'lov-backup-handle';
const HANDLE_STORE = 'handles';
const HANDLE_KEY = 'backupDir';
const DROPBOX_TOKEN_KEY = 'lov_dropbox_token';
const DROPBOX_FOLDER_KEY = 'lov_dropbox_folder';

// --- Dropbox ---
export function getDropboxConfig(): { token: string; folder: string } {
  try {
    return {
      token: localStorage.getItem(DROPBOX_TOKEN_KEY) || '',
      folder: localStorage.getItem(DROPBOX_FOLDER_KEY) || '/Imprimetrics',
    };
  } catch { return { token: '', folder: '/Imprimetrics' }; }
}
export function setDropboxConfig(token: string, folder: string) {
  try {
    if (token) localStorage.setItem(DROPBOX_TOKEN_KEY, token.trim());
    else localStorage.removeItem(DROPBOX_TOKEN_KEY);
    localStorage.setItem(DROPBOX_FOLDER_KEY, (folder || '/Imprimetrics').trim());
  } catch {}
}
async function uploadToDropbox(fileName: string, content: string): Promise<boolean> {
  const { token, folder } = getDropboxConfig();
  if (!token) return false;
  try {
    const path = `${folder.startsWith('/') ? folder : '/' + folder}/${fileName}`;
    const res = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/octet-stream',
        'Dropbox-API-Arg': JSON.stringify({
          path,
          mode: 'overwrite',
          autorename: false,
          mute: true,
        }),
      },
      body: content,
    });
    if (!res.ok) {
      console.warn('Dropbox upload falhou:', res.status, await res.text().catch(() => ''));
      return false;
    }
    return true;
  } catch (e) {
    console.warn('Dropbox upload erro:', e);
    return false;
  }
}
export async function testDropbox(): Promise<{ ok: boolean; message: string }> {
  const { token } = getDropboxConfig();
  if (!token) return { ok: false, message: 'Sem token configurado.' };
  try {
    const res = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return { ok: false, message: `Token inválido (${res.status}).` };
    const data = await res.json().catch(() => ({} as any));
    return { ok: true, message: `Conectado como ${data?.name?.display_name || data?.email || 'Dropbox'}.` };
  } catch (e: any) {
    return { ok: false, message: 'Erro de rede: ' + (e?.message || e) };
  }
}

// --- Persisted directory handle (File System Access API) ---
function idb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(HANDLE_DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(HANDLE_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function saveHandle(h: any) {
  const db = await idb();
  await new Promise((res, rej) => {
    const tx = db.transaction(HANDLE_STORE, 'readwrite');
    tx.objectStore(HANDLE_STORE).put(h, HANDLE_KEY);
    tx.oncomplete = () => res(null); tx.onerror = () => rej(tx.error);
  });
}
async function loadHandle(): Promise<any | null> {
  try {
    const db = await idb();
    return await new Promise((res, rej) => {
      const tx = db.transaction(HANDLE_STORE, 'readonly');
      const r = tx.objectStore(HANDLE_STORE).get(HANDLE_KEY);
      r.onsuccess = () => res(r.result || null); r.onerror = () => rej(r.error);
    });
  } catch { return null; }
}
async function clearHandle() {
  try {
    const db = await idb();
    await new Promise((res) => {
      const tx = db.transaction(HANDLE_STORE, 'readwrite');
      tx.objectStore(HANDLE_STORE).delete(HANDLE_KEY);
      tx.oncomplete = () => res(null);
    });
  } catch {}
}
async function ensurePermission(handle: any): Promise<boolean> {
  try {
    const opts = { mode: 'readwrite' as const };
    if ((await handle.queryPermission?.(opts)) === 'granted') return true;
    return (await handle.requestPermission?.(opts)) === 'granted';
  } catch { return false; }
}

export async function pickBackupFolder(): Promise<string | null> {
  // @ts-ignore
  if (typeof window === 'undefined' || !window.showDirectoryPicker) {
    alert('Seu navegador não suporta escolher pasta. Use Chrome ou Edge no desktop. O backup continuará indo para a pasta Downloads.');
    return null;
  }
  // @ts-ignore
  const handle = await window.showDirectoryPicker({ mode: 'readwrite', id: 'imprimetrics-backup' });
  await saveHandle(handle);
  return handle.name || 'pasta selecionada';
}

export async function getBackupFolderName(): Promise<string | null> {
  const h = await loadHandle();
  return h?.name || null;
}

export async function clearBackupFolder() {
  await clearHandle();
}

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

function downloadJson(obj: any, fileName: string) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function writeToFolder(handle: any, fileName: string, content: string): Promise<boolean> {
  try {
    if (!(await ensurePermission(handle))) return false;
    const fh = await handle.getFileHandle(fileName, { create: true });
    const w = await fh.createWritable();
    await w.write(content);
    await w.close();
    return true;
  } catch (e) {
    console.warn('Falha ao gravar backup na pasta escolhida, usando download:', e);
    return false;
  }
}

export async function runBackupNow() {
  const data = await collectBackup();
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `imprimetrics-backup-${ts}.json`;
  const json = JSON.stringify(data, null, 2);
  const handle = await loadHandle();
  let saved = false;
  if (handle) saved = await writeToFolder(handle, fileName, json);
  const dbxOk = await uploadToDropbox(fileName, json);
  if (!saved && !dbxOk) downloadJson(data, fileName);
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