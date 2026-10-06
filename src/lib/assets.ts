import type { Asset, Garment } from './types';
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
let demoPromise: Promise<{
  state: ReturnType<typeof emptyState>;
  mannequin: Asset;
}>;
export function loadDemo() {
  return (demoPromise ||= (async () => {
    const image = await loadImage(
      import.meta.env.BASE_URL + 'assets/wardrobe-atlas.png',
    );
    const size = image.naturalWidth / 3;
    const cell = (index: number): Asset => {
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const ctx = c.getContext('2d')!;
      ctx.drawImage(
        image,
        (index % 3) * size,
        Math.floor(index / 3) * size,
        size,
        size,
        0,
        0,
        size,
        size,
      );
      const pixels = ctx.getImageData(0, 0, size, size);
      let minX = size,
        minY = size,
        maxX = 0,
        maxY = 0;
      for (let y = 0; y < size; y++)
        for (let x = 0; x < size; x++)
          if (pixels.data[(y * size + x) * 4 + 3] > 160) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
      minX = Math.max(0, minX - 2);
      minY = Math.max(0, minY - 2);
      const w = Math.min(size - minX, maxX - minX + 5),
        h = Math.min(size - minY, maxY - minY + 5);
      const out = document.createElement('canvas');
      out.width = w;
      out.height = h;
      out.getContext('2d')!.drawImage(c, minX, minY, w, h, 0, 0, w, h);
      return { src: out.toDataURL('image/png'), width: w, height: h };
    };
    const atlas = Array.from({ length: 9 }, (_, i) => cell(i));
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
      item.demo = true;
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
  })());
}
