import type { Wardrobe } from './types';
import { validateState } from './model';
let database: Promise<IDBDatabase>;
const open = () =>
  (database ||= new Promise((resolve, reject) => {
    const r = indexedDB.open('gardirobum-react-v2', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('wardrobe');
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(Error('Bu tarayıcıda kayıt alanı açılamadı.'));
    r.onblocked = () =>
      reject(Error('Diğer gardırop sekmesini kapatıp tekrar dene.'));
  }));
export async function readState() {
  const db = await open();
  const raw = await new Promise<unknown>((resolve, reject) => {
    const tx = db.transaction('wardrobe', 'readonly'),
      r = tx.objectStore('wardrobe').get('state');
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
  if (!raw) return null;
  if ((raw as { version: number }).version !== 2) return null;
  return validateState(raw);
}
export async function writeState(value: Wardrobe) {
  const validated = validateState(value);
  const db = await open();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction('wardrobe', 'readwrite');
    tx.objectStore('wardrobe').put(validated, 'state');
    tx.oncomplete = () => resolve();
    tx.onerror = () =>
      reject(
        Error('Kaydedilemedi. Kayıt alanını kontrol et ve yedeğini indir.'),
      );
    tx.onabort = () =>
      reject(Error('Kayıt tamamlanmadı. Değişiklik uygulanmadı.'));
  });
}
