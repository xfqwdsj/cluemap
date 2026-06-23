// src/lib/file-history.ts

export type FileHistoryType = 'datasets' | 'stringsets' | 'locales';

export interface FileHistoryEntry {
  id: string;
  name: string;
  lastOpened: number;
  handle?: FileSystemFileHandle;
  url?: string;
}

const DB_NAME = 'cluemap-file-history';
const DB_VERSION = 1;
const STORE_NAME = 'handles';

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
  });
}

async function getHandle(id: string): Promise<FileSystemFileHandle | null> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

async function setHandle(id: string, handle: FileSystemFileHandle): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(handle, id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function deleteHandle(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

const STORAGE_KEY_PREFIX = 'cluemap:recent-';
const MAX_ENTRIES = 5;

interface StoredEntry {
  id: string;
  name: string;
  lastOpened: number;
  url?: string;
}

function getStorageKey(type: FileHistoryType): string {
  return `${STORAGE_KEY_PREFIX}${type}`;
}

export async function getRecentFiles(type: FileHistoryType): Promise<FileHistoryEntry[]> {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(getStorageKey(type));
    if (!data) return [];
    const stored = JSON.parse(data) as StoredEntry[];
    const sorted = stored.sort((a, b) => b.lastOpened - a.lastOpened);
    
    const entries: FileHistoryEntry[] = [];
    for (const s of sorted) {
      if (s.url) {
        entries.push({ ...s, handle: undefined });
      } else {
        const handle = await getHandle(s.id);
        if (handle) {
          entries.push({ ...s, handle });
        }
      }
    }
    return entries;
  } catch {
    return [];
  }
}

export async function addRecentFile(type: FileHistoryType, name: string, handle?: FileSystemFileHandle, url?: string): Promise<void> {
  const data = localStorage.getItem(getStorageKey(type));
  const stored: StoredEntry[] = data ? JSON.parse(data) : [];
  
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  
  const existingIndex = stored.findIndex(e => e.name === name);
  if (existingIndex >= 0) {
    stored[existingIndex].lastOpened = Date.now();
    if (url) stored[existingIndex].url = url;
    if (handle) await setHandle(stored[existingIndex].id, handle);
  } else {
    stored.unshift({ id, name, lastOpened: Date.now(), url });
    if (handle) await setHandle(id, handle);
  }
  
  const trimmed = stored
    .sort((a, b) => b.lastOpened - a.lastOpened)
    .slice(0, MAX_ENTRIES);
  
  localStorage.setItem(getStorageKey(type), JSON.stringify(trimmed));
}

export async function removeRecentFile(type: FileHistoryType, id: string): Promise<void> {
  const data = localStorage.getItem(getStorageKey(type));
  const stored: StoredEntry[] = data ? JSON.parse(data) : [];
  const filtered = stored.filter(e => e.id !== id);
  localStorage.setItem(getStorageKey(type), JSON.stringify(filtered));
  await deleteHandle(id);
}

export async function openFileFromHandle(handle: FileSystemFileHandle): Promise<File> {
  const h = handle as any;
  if (h.queryPermission && (await h.queryPermission({ mode: 'read' })) !== 'granted') {
    await h.requestPermission({ mode: 'read' });
  }
  return handle.getFile();
}

export async function getLastOpenedFile(type: FileHistoryType): Promise<FileHistoryEntry | null> {
  const entries = await getRecentFiles(type);
  return entries.length > 0 ? entries[0] : null;
}

export async function fetchFileFromUrl(url: string): Promise<File> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const blob = await response.blob();
  const fileName = url.split('/').pop()?.split('?')[0] || 'remote-file.json';
  return new File([blob], fileName, { type: blob.type || 'application/json' });
}
