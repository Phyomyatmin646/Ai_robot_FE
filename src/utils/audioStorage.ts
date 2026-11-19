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

/**
 * Decodes any audio file (MP3, WAV, AAC, M4A, OGG) using the browser's Web Audio API
 * and converts it into a standard 16,000 Hz, 16-bit Mono PCM WAV file for ESP32 hardware playback.
 */
export async function convertAudioFileToWav(file: File): Promise<{ wavFile: File; duration: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioCtx = new AudioContextClass();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  const duration = Math.round(audioBuffer.duration);

  // Resample and downmix to 16000 Hz Mono using OfflineAudioContext
  const targetSampleRate = 16000;
  const totalFrames = Math.ceil(audioBuffer.duration * targetSampleRate);
  const offlineCtx = new OfflineAudioContext(1, totalFrames, targetSampleRate);
  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineCtx.destination);
  source.start(0);

  const renderedBuffer = await offlineCtx.startRendering();
  audioCtx.close();

  const channelData = renderedBuffer.getChannelData(0);
  const numSamples = channelData.length;
  const wavBuffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(wavBuffer);

  // RIFF Chunk Descriptor
  writeAscii(view, 0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeAscii(view, 8, 'WAVE');

  // fmt sub-chunk
  writeAscii(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true);  // AudioFormat (1 = PCM)
  view.setUint16(22, 1, true);  // NumChannels (1 = Mono)
  view.setUint32(24, targetSampleRate, true); // SampleRate
  view.setUint32(28, targetSampleRate * 2, true); // ByteRate (SampleRate * 1 channel * 2 bytes)
  view.setUint16(32, 2, true);  // BlockAlign (1 channel * 2 bytes)
  view.setUint16(34, 16, true); // BitsPerSample (16-bit)

  // data sub-chunk
  writeAscii(view, 36, 'data');
  view.setUint32(40, numSamples * 2, true);

  // Write 16-bit PCM samples with clipping protection
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, channelData[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  const cleanName = file.name.replace(/\.[^/.]+$/, '') + '.wav';
  const wavFile = new File([wavBuffer], cleanName, { type: 'audio/wav' });

  return { wavFile, duration };
}

function writeAscii(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
