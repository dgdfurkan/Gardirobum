import manifest from './demo-assets.json';
import type { Asset, Garment, Wardrobe } from './types';
import { newGarment, emptyState, defaultGarmentAnchors } from './model';
export const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(Error('Fotoğraf açılamadı.'));
    i.src = src;
  });
export async function readPhoto(file: File): Promise<Asset> {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type))
    throw Error('PNG, JPEG veya WebP fotoğraf seç.');
  if (file.size > 12 * 1024 * 1024)
    throw Error('Fotoğraf 12 MB’den küçük olmalı.');
  const src = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(Error('Dosya okunamadı.'));
    r.readAsDataURL(file);
  });
  const i = await loadImage(src);
  if (i.naturalWidth * i.naturalHeight > 36e6)
    throw Error('36 megapikselden küçük bir fotoğraf ekle.');
  return { src, width: i.naturalWidth, height: i.naturalHeight };
}
let demoPromise:
  | Promise<{
      state: ReturnType<typeof emptyState>;
      mannequin: Asset;
    }>
  | undefined;
export function loadDemo() {
  return (demoPromise ||= (async () => {
    const readDemoAsset = async (entry: {
      file: string;
      width: number;
      height: number;
    }): Promise<Asset> => {
      const response = await fetch(import.meta.env.BASE_URL + entry.file);
      if (!response.ok) throw Error('Örnek kıyafet görseli yüklenemedi.');
      const blob = await response.blob();
      const src = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(Error('Örnek görsel okunamadı.'));
        reader.readAsDataURL(blob);
      });
      return { src, width: entry.width, height: entry.height };
    };
    const [atlas, rackEntries] = await Promise.all([
      Promise.all(manifest.tryon.map(readDemoAsset)),
      Promise.all(
        Object.entries(manifest.rack).map(
          async ([key, entry]) =>
            [
              key,
              {
                image: await readDemoAsset(entry),
                pivot: entry.pivot,
                scale: entry.scale,
              },
            ] as const,
        ),
      ),
    ]);
    const rack = Object.fromEntries(rackEntries);
    const spec = [
      ['demo-white', 'Beyaz Tişört', 'tshirt', 'Beyaz', 0],
      ['demo-black', 'Siyah Tişört', 'tshirt', 'Siyah', 1],
      ['demo-shirt', 'Zeytin Yeşili Gömlek', 'shirt', 'Zeytin Yeşili', 2],
      ['demo-jeans', 'Mavi Jean', 'pants', 'Mavi', 4],
      ['demo-chino', 'Kum Rengi Chino', 'pants', 'Bej', 5],
      ['demo-sneakers', 'Beyaz Sneaker', 'shoes', 'Beyaz', 6],
      ['demo-cap', 'Siyah Şapka', 'cap', 'Siyah', 7],
    ] as const;
    const categories = {
      tshirt: 'top',
      shirt: 'shirt',
      pants: 'bottom',
      shoes: 'shoes',
      cap: 'accessory',
    } as const;
    const items: Garment[] = spec.map(([id, name, kind, color, index]) => {
      const item = newGarment(atlas[index]);
      item.id = id;
      item.name = name;
      item.kind = kind;
      item.category = categories[kind];
      item.color = color;
      item.neck =
        kind === 'shirt'
          ? 'Gömlek Yaka'
          : kind === 'tshirt'
            ? 'Bisiklet Yaka'
            : 'Uygulanmaz';
      item.demo = true;
      const prefix = id.replace('demo-', '');
      const front = rack[prefix + '-front'],
        side = rack[prefix + '-side'];
      if (front && side)
        item.rack = {
          front: front.image,
          side: side.image,
          frontPivot: front.pivot,
          sidePivot: side.pivot,
          frontScale: front.scale,
          sideScale: side.scale,
          revision: 1,
        };
      item.position = 'head';
      item.sleeve =
        kind === 'shirt' ? 'long' : kind === 'tshirt' ? 'short' : 'none';
      item.anchors = defaultGarmentAnchors(item.category, item.sleeve);
      if (kind === 'shirt') {
        item.images.open = atlas[3];
        item.opening = 'open';
      }
      return item;
    });
    return { state: emptyState(items, atlas[8]), mannequin: atlas[8] };
  })().catch((error) => {
    demoPromise = undefined;
    throw error;
  }));
}

export function upgradeDemoRack(saved: Wardrobe, demo: Wardrobe): Wardrobe {
  let changed = false;
  const items = saved.items.map((item) => {
    const seed = demo.items.find((x) => x.id === item.id);
    if (
      !item.demo ||
      !seed?.rack ||
      (item.rack?.revision || 0) >= (seed.rack.revision || 0)
    )
      return item;
    changed = true;
    return { ...item, rack: structuredClone(seed.rack) };
  });
  return changed ? { ...saved, items } : saved;
}
