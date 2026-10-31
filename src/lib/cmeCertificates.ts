/**
 * Certificate photos for CME activities, kept on this device only.
 *
 * They are never synced: the CME record syncs through the account, but photos
 * are too large for it and may show the holder's licence number. Inside the
 * iOS app each photo is a JPEG in the app's private Data directory; on the web
 * (development) it falls back to the storage helpers.
 *
 * Photos are shrunk to at most 1600 px on the long side so a page of text stays
 * legible while each file stays around 200–400 KB.
 */
import { Capacitor } from '@capacitor/core';
import { getItem, removeItem, setItem } from './storage';

const DIR = 'cme-certificates';
const MAX_SIDE = 1600;
const QUALITY = 0.8;

const webKey = (id: string) => `uroapp.cme.cert.${id}`;
const filePath = (id: string) => `${DIR}/${id}.jpg`;

/** Read an image file, downscale it and return a JPEG data URL. */
export async function compressImage(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Not a readable image'));
      el.src = url;
    });
    const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas unavailable');
    ctx.fillStyle = '#fff'; // transparent PNGs would otherwise turn black
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', QUALITY);
  } finally {
    URL.revokeObjectURL(url);
  }
}

const fs = () => import('@capacitor/filesystem');

export async function saveCertificate(id: string, dataUrl: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) return setItem(webKey(id), dataUrl);
  const { Filesystem, Directory } = await fs();
  await Filesystem.writeFile({
    path: filePath(id),
    data: dataUrl.slice(dataUrl.indexOf(',') + 1),
    directory: Directory.Data,
    recursive: true,
  });
}

/** The certificate as a data URL, or null when this activity has none here. */
export async function loadCertificate(id: string): Promise<string | null> {
  if (!Capacitor.isNativePlatform()) return getItem(webKey(id));
  const { Filesystem, Directory } = await fs();
  try {
    const { data } = await Filesystem.readFile({ path: filePath(id), directory: Directory.Data });
    return typeof data === 'string' ? `data:image/jpeg;base64,${data}` : null;
  } catch {
    return null; // no file for this activity
  }
}

export async function deleteCertificate(id: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) return removeItem(webKey(id));
  const { Filesystem, Directory } = await fs();
  try {
    await Filesystem.deleteFile({ path: filePath(id), directory: Directory.Data });
  } catch {
    /* already gone */
  }
}

/** Load the certificates for these activities; ids without one are left out. */
export async function loadCertificates(ids: string[]): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  await Promise.all(
    ids.map(async (id) => {
      const c = await loadCertificate(id);
      if (c) out[id] = c;
    }),
  );
  return out;
}
