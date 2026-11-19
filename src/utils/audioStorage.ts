// IndexedDB Storage utility for offline / custom audio tracks in the browser

export interface CustomAudioTrack {
  id: string;
  fileName: string;
  englishName?: string;
  category: string;
  duration: number;
  fileSize: number;
  description: string;
  audioType: string;
  createdAt: number;
  isCustom: boolean;
}

const DB_NAME = 'AiRobot_AudioDB';
const DB_VERSION = 1;
const STORE_TRACKS = 'tracks';
const STORE_BLOBS = 'blobs';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_TRACKS)) {
        db.createObjectStore(STORE_TRACKS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_BLOBS)) {
        db.createObjectStore(STORE_BLOBS);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Memory cache for active object URLs
const urlCache = new Map<string, string>();

export async function saveAudioTrack(track: CustomAudioTrack, blob: Blob): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_TRACKS, STORE_BLOBS], 'readwrite');
    tx.objectStore(STORE_TRACKS).put(track);
    tx.objectStore(STORE_BLOBS).put(blob, track.id);

    tx.oncomplete = () => {
      // Cache object URL
      const objUrl = URL.createObjectURL(blob);
      urlCache.set(track.id, objUrl);
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCustomAudioTracks(): Promise<CustomAudioTrack[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_TRACKS, 'readonly');
      const store = tx.objectStore(STORE_TRACKS);
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to load from IndexedDB, falling back to empty list', err);
    return [];
  }
}

export async function getAudioBlobUrl(id: string): Promise<string | null> {
  if (urlCache.has(id)) {
    return urlCache.get(id)!;
  }

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_BLOBS, 'readonly');
      const store = tx.objectStore(STORE_BLOBS);
      const req = store.get(id);

      req.onsuccess = () => {
        const blob = req.result as Blob | undefined;
        if (blob) {
          const url = URL.createObjectURL(blob);
          urlCache.set(id, url);
          resolve(url);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function deleteAudioTrack(id: string): Promise<void> {
  try {
    if (urlCache.has(id)) {
      URL.revokeObjectURL(urlCache.get(id)!);
      urlCache.delete(id);
    }
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_TRACKS, STORE_BLOBS], 'readwrite');
      tx.objectStore(STORE_TRACKS).delete(id);
      tx.objectStore(STORE_BLOBS).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to delete track from IndexedDB', err);
  }
}
