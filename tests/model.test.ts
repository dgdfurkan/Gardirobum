import { describe, it, expect } from 'vitest';
import {
  newGarment,
  defaultBody,
  assetFor,
  selectItem,
  randomOutfit,
  resultKey,
  restoreOutfit,
  validateState,
  outfitSettings,
} from '../src/lib/model';
import { affine, mesh, garmentTargets } from '../src/lib/warp';
import type { Asset, Wardrobe, Garment } from '../src/lib/types';
const photo: Asset = {
  src: 'data:image/png;base64,AAAA',
  width: 100,
  height: 200,
};
const piece = (id: string, name: string) => ({
  ...newGarment(photo),
  id,
  name,
});
function state(): Wardrobe {
  const white = piece('white', 'Beyaz'),
    black = piece('black', 'Siyah'),
    shirt = {
      ...piece('shirt', 'Gömlek'),
      kind: 'shirt',
      category: 'shirt',
      sleeve: 'long',
      images: {
        front: photo,
        open: { ...photo, src: 'data:image/png;base64,BBBB' },
      },
    } as Garment;
  return {
    version: 2,
    items: [white, black, shirt],
    selected: ['white'],
    saved: [],
    person: {
      photo: null,
      anchors: structuredClone(defaultBody),
      calibrated: false,
      height: null,
      revision: 0,
    },
    results: {},
    revision: 0,
  };
}
describe('parça kimliği ve kombinler', () => {
  it('siyah tişörtü seçince beyazı kaldırır ve doğru görseli seçer', () => {
    const s = state();
    s.items[1].images.front = { ...photo, src: 'data:image/png;base64,CCCC' };
    const n = selectItem(s, 'black');
    expect(n.selected).toEqual(['black']);
    expect(
      assetFor(n.items.find((i) => i.id === n.selected[0])!).src,
    ).toContain('CCCC');
    expect(s.selected).toEqual(['white']);
  });
  it('tişört, gömlek ve mont ayrı katmanlardır', () => {
    let s = selectItem(state(), 'shirt');
    const jacket = {
      ...piece('coat', 'Kaban'),
      category: 'outerwear',
      kind: 'coat',
    } as Garment;
    s.items.push(jacket);
    s = selectItem(s, 'coat');
    expect(s.selected).toEqual(['white', 'shirt', 'coat']);
  });
  it('sol ve sağ bilekteki saatler ayrı seçim; aynı bilekteki saat değişir', () => {
    let s = state();
    s.items.push(
      {
        ...piece('a', 'Saat 1'),
        category: 'accessory',
        kind: 'watch',
        position: 'leftWrist',
      },
      {
        ...piece('b', 'Saat 2'),
        category: 'accessory',
        kind: 'watch',
        position: 'rightWrist',
      },
      {
        ...piece('c', 'Saat 3'),
        category: 'accessory',
        kind: 'watch',
        position: 'leftWrist',
      },
    );
    s = selectItem(selectItem(selectItem(s, 'a'), 'b'), 'c');
    expect(s.selected).toEqual(['white', 'b', 'c']);
  });
  it('kordonun kendi fotoğrafını gösterir, ana saati değiştirmez', () => {
    const i = piece('watch', 'Saat');
    i.variants = [
      {
        id: 'green',
        name: 'Yeşil Kordon',
        color: 'Yeşil',
        image: { ...photo, src: 'data:image/png;base64,DDDD' },
      },
    ];
    i.activeVariant = 'green';
    expect(assetFor(i).src).toContain('DDDD');
    expect(i.images.front.src).toContain('AAAA');
  });
  it('kombin kaydı gömlek açıklığı ve kordon seçimini de geri getirir', () => {
    const s = state();
    s.selected = ['shirt'];
    s.items[2].opening = 'open';
    const o = {
      id: 'o',
      name: 'Kombin',
      items: ['shirt'],
      settings: outfitSettings(s),
      created: '',
    };
    s.items[2].opening = 'closed';
    const n = restoreOutfit(s, o);
    expect(n.items[2].opening).toBe('open');
    expect(assetFor(n.items[2]).src).toContain('BBBB');
  });
  it('rastgele seçimin her parçayı bir kez seçmesi', () => {
    const s = state();
    for (let i = 0; i < 100; i++) {
      const selection = randomOutfit(s);
      expect(new Set(selection).size).toBe(selection.length);
      expect(selection.every((id) => s.items.some((i) => i.id === id))).toBe(
        true,
      );
    }
  });
});
describe('yerleşim ve doğrulama', () => {
  it('affine üç kaynak noktasını tam hedef noktalara taşır', () => {
    const source = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
      ],
      target = [
        { x: 0.2, y: 0.3 },
        { x: 0.8, y: 0.35 },
        { x: 0.25, y: 0.9 },
      ],
      m = affine(source, target)!;
    source.forEach((p, i) => {
      expect(m[0] * p.x + m[2] * p.y + m[4]).toBeCloseTo(target[i].x, 10);
      expect(m[1] * p.x + m[3] * p.y + m[5]).toBeCloseTo(target[i].y, 10);
    });
    expect(
      affine(
        [
          { x: 0, y: 0 },
          { x: 0, y: 0 },
          { x: 0, y: 0 },
        ],
        target,
      ),
    ).toBeNull();
  });
  it('işaretlenen omuz hedefi tişört ağını belirler', () => {
    const s = state(),
      i = s.items[0];
    s.person.anchors.shoulderLeft = { x: 0.15, y: 0.27 };
    const targets = garmentTargets(i, s.person);
    expect(targets.shoulderLeft.x).toBeCloseTo(0.15, 12);
    expect(targets.shoulderLeft.y).toBeCloseTo(0.27, 12);
    const triangles = mesh(i.anchors, targets);
    expect(triangles.length).toBeGreaterThan(3);
    expect(triangles.every((t) => t.matrix.every(Number.isFinite))).toBe(true);
  });
  it('kıyafet ya da kordon değişince eski gerçekçi sonucu kullanmaz', () => {
    const s = state(),
      key = resultKey(s);
    s.items[0].fit = 'oversize';
    expect(resultKey(s)).not.toBe(key);
    const next = resultKey(s);
    s.person.photo = { ...photo, src: 'data:image/png;base64,DDDD' };
    expect(resultKey(s)).not.toBe(next);
  });
  it('geçersiz yedek ve gömülü dış fotoğraf URL’sini reddeder', () => {
    expect(() => validateState({ version: 1 })).toThrow();
    const s = state();
    s.items[0].images.front.src = 'javascript:alert(1)';
    expect(() => validateState(s)).toThrow();
  });
  it('eksik yerleşimi ve bilinmeyen parça içeren kombini reddeder', () => {
    const s = state();
    s.items[0].anchors = {};
    expect(() => validateState(s)).toThrow();
    const n = state();
    n.saved = [
      {
        id: 'bad',
        name: 'Bozuk',
        items: ['missing'],
        settings: {},
        created: '',
      },
    ];
    expect(() => validateState(n)).toThrow();
  });
  it('çakışan parça yuvalarını normalize edip özgün veriyi değiştirmez', () => {
    const s = state();
    s.selected = ['white', 'black', 'shirt'];
    const n = validateState(s);
    expect(n.selected).toEqual(['white', 'shirt']);
    expect(s.selected).toHaveLength(3);
  });
});
