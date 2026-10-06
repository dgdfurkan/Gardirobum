import type {
  Category,
  Garment,
  Kind,
  Person,
  Point,
  Wardrobe,
  Asset,
} from './types';
export const categoryLabels: Record<Category, string> = {
  top: 'Üstler',
  shirt: 'Gömlekler',
  outerwear: 'Dış Giyim',
  bottom: 'Altlar',
  shoes: 'Ayakkabılar',
  accessory: 'Saat & Aksesuar',
};
export const kindLabels: Record<Kind, string> = {
  tshirt: 'Tişört',
  sweater: 'Kazak',
  hoodie: 'Kapüşonlu',
  shirt: 'Gömlek',
  jacket: 'Ceket',
  coat: 'Kaban',
  puffer: 'Mont',
  pants: 'Pantolon',
  shorts: 'Şort',
  shoes: 'Ayakkabı',
  watch: 'Kol Saati',
  smartwatch: 'Akıllı Saat',
  cap: 'Şapka',
  glasses: 'Gözlük',
  necklace: 'Kolye',
  belt: 'Kemer',
  bag: 'Çanta',
};
export const kindCategories: Record<Kind, Category> = {
  tshirt: 'top',
  sweater: 'top',
  hoodie: 'top',
  shirt: 'shirt',
  jacket: 'outerwear',
  coat: 'outerwear',
  puffer: 'outerwear',
  pants: 'bottom',
  shorts: 'bottom',
  shoes: 'shoes',
  watch: 'accessory',
  smartwatch: 'accessory',
  cap: 'accessory',
  glasses: 'accessory',
  necklace: 'accessory',
  belt: 'accessory',
  bag: 'accessory',
};
export const bodyLabels: Record<string, string> = {
  head: 'Baş Üstü',
  eyes: 'Göz Hattı',
  neckLeft: 'Sol Yaka',
  neckRight: 'Sağ Yaka',
  shoulderLeft: 'Sol Omuz',
  shoulderRight: 'Sağ Omuz',
  armpitLeft: 'Sol Koltuk Altı',
  armpitRight: 'Sağ Koltuk Altı',
  elbowLeft: 'Sol Dirsek',
  elbowRight: 'Sağ Dirsek',
  wristLeft: 'Sol Bilek',
  wristRight: 'Sağ Bilek',
  waistLeft: 'Sol Bel',
  waistRight: 'Sağ Bel',
  hipLeft: 'Sol Kalça',
  hipRight: 'Sağ Kalça',
  kneeLeft: 'Sol Diz',
  kneeRight: 'Sağ Diz',
  ankleLeft: 'Sol Ayak Bileği',
  ankleRight: 'Sağ Ayak Bileği',
  footLeft: 'Sol Ayak Ucu',
  footRight: 'Sağ Ayak Ucu',
};
export const defaultBody: Record<string, Point> = {
  head: { x: 0.5, y: 0.02 },
  eyes: { x: 0.5, y: 0.1 },
  neckLeft: { x: 0.4, y: 0.17 },
  neckRight: { x: 0.6, y: 0.17 },
  shoulderLeft: { x: 0.16, y: 0.21 },
  shoulderRight: { x: 0.84, y: 0.21 },
  armpitLeft: { x: 0.25, y: 0.31 },
  armpitRight: { x: 0.75, y: 0.31 },
  elbowLeft: { x: 0.09, y: 0.4 },
  elbowRight: { x: 0.91, y: 0.4 },
  wristLeft: { x: 0.08, y: 0.57 },
  wristRight: { x: 0.92, y: 0.57 },
  waistLeft: { x: 0.23, y: 0.48 },
  waistRight: { x: 0.77, y: 0.48 },
  hipLeft: { x: 0.22, y: 0.53 },
  hipRight: { x: 0.78, y: 0.53 },
  kneeLeft: { x: 0.28, y: 0.75 },
  kneeRight: { x: 0.72, y: 0.75 },
  ankleLeft: { x: 0.28, y: 0.93 },
  ankleRight: { x: 0.72, y: 0.93 },
  footLeft: { x: 0.25, y: 0.98 },
  footRight: { x: 0.75, y: 0.98 },
};
export const upperLabels = {
  neckLeft: 'Sol Yaka',
  neckRight: 'Sağ Yaka',
  shoulderLeft: 'Sol Omuz',
  shoulderRight: 'Sağ Omuz',
  sleeveLeft: 'Sol Kol Ucu',
  sleeveRight: 'Sağ Kol Ucu',
  armpitLeft: 'Sol Koltuk Altı',
  armpitRight: 'Sağ Koltuk Altı',
  hemLeft: 'Sol Etek Ucu',
  hemRight: 'Sağ Etek Ucu',
};
export const pantsLabels = {
  waistLeft: 'Sol Bel',
  waistRight: 'Sağ Bel',
  hipLeft: 'Sol Kalça',
  hipRight: 'Sağ Kalça',
  crotch: 'Ağ Noktası',
  kneeLeftOuter: 'Sol Diz Dışı',
  kneeLeftInner: 'Sol Diz İçi',
  kneeRightInner: 'Sağ Diz İçi',
  kneeRightOuter: 'Sağ Diz Dışı',
  ankleLeftOuter: 'Sol Paça Dışı',
  ankleLeftInner: 'Sol Paça İçi',
  ankleRightInner: 'Sağ Paça İçi',
  ankleRightOuter: 'Sağ Paça Dışı',
};
export function defaultGarmentAnchors(
  category: Category,
  sleeve = 'short',
): Record<string, Point> {
  if (category === 'bottom')
    return {
      waistLeft: { x: 0.03, y: 0.01 },
      waistRight: { x: 0.97, y: 0.01 },
      hipLeft: { x: 0.01, y: 0.17 },
      hipRight: { x: 0.99, y: 0.17 },
      crotch: { x: 0.5, y: 0.3 },
      kneeLeftOuter: { x: 0.02, y: 0.6 },
      kneeLeftInner: { x: 0.45, y: 0.6 },
      kneeRightInner: { x: 0.55, y: 0.6 },
      kneeRightOuter: { x: 0.98, y: 0.6 },
      ankleLeftOuter: { x: 0.03, y: 0.99 },
      ankleLeftInner: { x: 0.43, y: 0.99 },
      ankleRightInner: { x: 0.57, y: 0.99 },
      ankleRightOuter: { x: 0.97, y: 0.99 },
    };
  return {
    neckLeft: { x: 0.43, y: 0.04 },
    neckRight: { x: 0.57, y: 0.04 },
    shoulderLeft: { x: 0.24, y: 0.09 },
    shoulderRight: { x: 0.76, y: 0.09 },
    sleeveLeft: { x: 0.04, y: sleeve === 'long' ? 0.92 : 0.37 },
    sleeveRight: { x: 0.96, y: sleeve === 'long' ? 0.92 : 0.37 },
    armpitLeft: { x: 0.24, y: 0.44 },
    armpitRight: { x: 0.76, y: 0.44 },
    hemLeft: { x: 0.18, y: 0.99 },
    hemRight: { x: 0.82, y: 0.99 },
  };
}
export const uid = () => crypto.randomUUID();
export function newGarment(front: Asset): Garment {
  return {
    id: uid(),
    name: '',
    category: 'top',
    kind: 'tshirt',
    color: '',
    fit: 'regular',
    length: 'regular',
    neck: 'Bisiklet Yaka',
    sleeve: 'short',
    size: '',
    cmLength: null,
    cmWidth: null,
    opening: 'closed',
    tucked: false,
    notes: '',
    position: 'leftWrist',
    images: { front: { ...front } },
    variants: [],
    activeVariant: null,
    anchors: defaultGarmentAnchors('top'),
    placement: { x: 0, y: 0, scale: 1, rotation: 0 },
    demo: false,
  };
}
export function assetFor(item: Garment): Asset {
  const variant = item.variants.find((v) => v.id === item.activeVariant);
  if (variant?.image) return variant.image;
  if (item.opening === 'open' && item.images.open) return item.images.open;
  if (item.opening === 'partial' && item.images.partial)
    return item.images.partial;
  return item.images.front;
}
export function slotFor(item: Garment) {
  return item.category === 'accessory'
    ? 'accessory:' + item.position
    : item.category;
}
export function selectItem(state: Wardrobe, id: string): Wardrobe {
  const item = state.items.find((i) => i.id === id);
  if (!item) return state;
  if (state.selected.includes(id))
    return { ...state, selected: state.selected.filter((x) => x !== id) };
  return {
    ...state,
    selected: [
      ...state.selected.filter((x) => {
        const old = state.items.find((i) => i.id === x);
        return old && slotFor(old) !== slotFor(item);
      }),
      id,
    ],
  };
}
export function normalizeSelected(state: Wardrobe, ids: string[]) {
  const slots = new Set<string>();
  return ids.filter((id) => {
    const i = state.items.find((x) => x.id === id);
    if (!i || slots.has(slotFor(i))) return false;
    slots.add(slotFor(i));
    return true;
  });
}
export function randomOutfit(state: Wardrobe, rng = Math.random): string[] {
  const out: string[] = [];
  for (const c of [
    'top',
    'bottom',
    'shoes',
    'shirt',
    'outerwear',
    'accessory',
  ] as Category[]) {
    const list = state.items.filter((i) => i.category === c);
    if (
      !list.length ||
      (['shirt', 'outerwear', 'accessory'].includes(c) && rng() < 0.4)
    )
      continue;
    out.push(
      list[Math.min(list.length - 1, Math.floor(rng() * list.length))].id,
    );
  }
  return out;
}
export function selectedSnapshot(state: Wardrobe) {
  return state.selected
    .map((id) => state.items.find((i) => i.id === id))
    .filter((i): i is Garment => !!i);
}
export function outfitSettings(state: Wardrobe) {
  return Object.fromEntries(
    selectedSnapshot(state).map((i) => [
      i.id,
      { opening: i.opening, tucked: i.tucked, variant: i.activeVariant },
    ]),
  );
}
export function restoreOutfit(
  state: Wardrobe,
  outfit: Wardrobe['saved'][number],
) {
  const next = {
    ...state,
    items: state.items.map((i) => {
      const c = outfit.settings[i.id];
      return c
        ? {
            ...i,
            opening: c.opening,
            tucked: c.tucked,
            activeVariant: c.variant,
          }
        : i;
    }),
  };
  return { ...next, selected: normalizeSelected(next, outfit.items) };
}
export function resultKey(state: Wardrobe) {
  const string = JSON.stringify({
    person: state.person.photo?.src,
    items: selectedSnapshot(state)
      .map((i) => ({ ...i, placement: undefined }))
      .sort((a, b) => a.id.localeCompare(b.id)),
  });
  let h = 2166136261;
  for (let i = 0; i < string.length; i++) {
    h ^= string.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}
export function emptyState(items: Garment[], photo: Asset): Wardrobe {
  return {
    version: 2,
    items,
    selected: ['demo-white', 'demo-jeans', 'demo-sneakers'],
    saved: [],
    person: {
      photo: null,
      anchors: { ...defaultBody },
      calibrated: false,
      height: null,
      revision: 0,
    },
    results: {},
    revision: 0,
  };
}
export const fitLabels = {
  regular: 'Normal',
  oversize: 'Bol / Oversize',
  slim: 'Dar',
};
export const openingLabels = {
  closed: 'Kapalı',
  open: 'Açık',
  partial: 'Yarı Kapalı',
};
export function isAsset(a: unknown): a is Asset {
  const x = a as Asset;
  return (
    !!x &&
    typeof x.src === 'string' &&
    /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(x.src) &&
    x.src.length < 18e6 &&
    Number.isFinite(x.width) &&
    x.width > 0 &&
    Number.isFinite(x.height) &&
    x.height > 0
  );
}
const finitePoint = (p: unknown): p is Point =>
  !!p &&
  Number.isFinite((p as Point).x) &&
  Number.isFinite((p as Point).y) &&
  (p as Point).x >= 0 &&
  (p as Point).x <= 1 &&
  (p as Point).y >= 0 &&
  (p as Point).y <= 1;
export function validateState(raw: unknown): Wardrobe {
  const v = raw as Wardrobe;
  if (
    !v ||
    v.version !== 2 ||
    !Array.isArray(v.items) ||
    v.items.length > 300 ||
    !Array.isArray(v.selected) ||
    !Array.isArray(v.saved) ||
    !v.person
  )
    throw Error('Geçerli bir gardırop yedeği değil.');
  const ids = new Set<string>();
  for (const i of v.items) {
    if (
      !i ||
      typeof i.id !== 'string' ||
      !i.id ||
      ids.has(i.id) ||
      typeof i.name !== 'string' ||
      !i.name.trim() ||
      !Object.hasOwn(categoryLabels, i.category) ||
      !Object.hasOwn(kindLabels, i.kind) ||
      kindCategories[i.kind] !== i.category ||
      !isAsset(i.images?.front)
    )
      throw Error('Yedekte geçersiz veya eksik bir parça var.');
    ids.add(i.id);
    if (
      !Object.hasOwn(fitLabels, i.fit) ||
      !['regular', 'long', 'short'].includes(i.length) ||
      !Object.hasOwn(openingLabels, i.opening) ||
      typeof i.tucked !== 'boolean' ||
      !i.placement ||
      ![
        i.placement.x,
        i.placement.y,
        i.placement.scale,
        i.placement.rotation,
      ].every(Number.isFinite) ||
      !Array.isArray(i.variants)
    )
      throw Error('Parça ayarları geçersiz.');
    for (const image of Object.values(i.images))
      if (image && !isAsset(image))
        throw Error('Yedekteki bir fotoğraf geçersiz.');
    for (const key of Object.keys(defaultGarmentAnchors(i.category, i.sleeve)))
      if (!finitePoint(i.anchors?.[key]))
        throw Error('Yerleşim noktaları eksik veya geçersiz.');
    if (
      !['short', 'long', 'none'].includes(i.sleeve) ||
      ![
        'leftWrist',
        'rightWrist',
        'head',
        'eyes',
        'neck',
        'waist',
        'bag',
      ].includes(i.position) ||
      ![i.color, i.neck, i.size, i.notes].every((x) => typeof x === 'string') ||
      typeof i.demo !== 'boolean' ||
      i.placement.scale <= 0
    )
      throw Error('Parça bilgileri geçersiz.');
    if (
      (i.cmLength !== null &&
        (!Number.isFinite(i.cmLength) || i.cmLength < 1 || i.cmLength > 250)) ||
      (i.cmWidth !== null &&
        (!Number.isFinite(i.cmWidth) || i.cmWidth < 1 || i.cmWidth > 200))
    )
      throw Error('Parça ölçüleri geçersiz.');
    for (const x of i.variants)
      if (
        !x ||
        typeof x.id !== 'string' ||
        typeof x.name !== 'string' ||
        (x.image && !isAsset(x.image))
      )
        throw Error('Saat/kordon seçeneği geçersiz.');
  }
  if (v.person.photo && !isAsset(v.person.photo))
    throw Error('Kişi fotoğrafı geçersiz.');
  for (const key of Object.keys(defaultBody))
    if (!finitePoint(v.person.anchors?.[key]))
      throw Error('Vücut kalibrasyonu eksik.');
  if (v.saved.length > 100) throw Error('En fazla 100 kombin saklanabilir.');
  for (const o of v.saved)
    if (
      !o ||
      typeof o.id !== 'string' ||
      typeof o.name !== 'string' ||
      !Array.isArray(o.items) ||
      o.items.some((id) => !ids.has(id)) ||
      !o.settings ||
      Object.values(o.settings).some(
        (x) =>
          !x ||
          !Object.hasOwn(openingLabels, x.opening) ||
          typeof x.tucked !== 'boolean' ||
          (x.variant !== null && typeof x.variant !== 'string'),
      )
    )
      throw Error('Kayıtlı kombin geçersiz.');
  for (const image of Object.values(v.results || {}))
    if (!isAsset(image)) throw Error('Deneme sonucu geçersiz.');
  const next = structuredClone(v);
  for (const i of next.items)
    if (
      i.activeVariant &&
      !i.variants.some((x) => x.id === i.activeVariant && x.image)
    )
      i.activeVariant = null;
  next.selected = normalizeSelected(next, v.selected);
  next.results = next.results || {};
  next.revision = Number.isFinite(next.revision) ? next.revision : 0;
  return next;
}
