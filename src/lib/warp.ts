import Delaunator from 'delaunator';
import type { Point, Garment, Person } from './types';
export const lerp = (a: Point, b: Point, t: number): Point => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});
export function affine(source: Point[], target: Point[]): number[] | null {
  const [p, q, r] = source,
    [a, b, c] = target;
  const den = (q.x - p.x) * (r.y - p.y) - (r.x - p.x) * (q.y - p.y);
  if (Math.abs(den) < 1e-8) return null;
  const xx = ((b.x - a.x) * (r.y - p.y) - (c.x - a.x) * (q.y - p.y)) / den;
  const xy = ((c.x - a.x) * (q.x - p.x) - (b.x - a.x) * (r.x - p.x)) / den;
  const yx = ((b.y - a.y) * (r.y - p.y) - (c.y - a.y) * (q.y - p.y)) / den;
  const yy = ((c.y - a.y) * (q.x - p.x) - (b.y - a.y) * (r.x - p.x)) / den;
  return [xx, yx, xy, yy, a.x - xx * p.x - xy * p.y, a.y - yx * p.x - yy * p.y];
}
export function garmentTargets(item: Garment, person: Person) {
  const b = person.anchors;
  let target: Record<string, Point>;
  if (item.category === 'bottom') {
    target = {
      waistLeft: b.waistLeft,
      waistRight: b.waistRight,
      hipLeft: b.hipLeft,
      hipRight: b.hipRight,
      crotch: lerp(
        lerp(b.hipLeft, b.hipRight, 0.5),
        lerp(b.kneeLeft, b.kneeRight, 0.5),
        0.3,
      ),
      kneeLeftOuter: { ...b.kneeLeft, x: b.kneeLeft.x - 0.11 },
      kneeLeftInner: { ...b.kneeLeft, x: b.kneeLeft.x + 0.11 },
      kneeRightInner: { ...b.kneeRight, x: b.kneeRight.x - 0.11 },
      kneeRightOuter: { ...b.kneeRight, x: b.kneeRight.x + 0.11 },
      ankleLeftOuter: {
        ...(item.kind === 'shorts'
          ? lerp(b.hipLeft, b.kneeLeft, 0.8)
          : b.ankleLeft),
        x: b.ankleLeft.x - 0.1,
      },
      ankleLeftInner: {
        ...(item.kind === 'shorts'
          ? lerp(b.hipLeft, b.kneeLeft, 0.8)
          : b.ankleLeft),
        x: b.ankleLeft.x + 0.1,
      },
      ankleRightInner: {
        ...(item.kind === 'shorts'
          ? lerp(b.hipRight, b.kneeRight, 0.8)
          : b.ankleRight),
        x: b.ankleRight.x - 0.1,
      },
      ankleRightOuter: {
        ...(item.kind === 'shorts'
          ? lerp(b.hipRight, b.kneeRight, 0.8)
          : b.ankleRight),
        x: b.ankleRight.x + 0.1,
      },
    };
  } else {
    const hem =
      item.length === 'long' ? 1.5 : item.length === 'short' ? 0.3 : 1;
    target = {
      neckLeft: b.neckLeft,
      neckRight: b.neckRight,
      shoulderLeft: b.shoulderLeft,
      shoulderRight: b.shoulderRight,
      sleeveLeft:
        item.sleeve === 'long'
          ? b.wristLeft
          : lerp(b.shoulderLeft, b.elbowLeft, 0.75),
      sleeveRight:
        item.sleeve === 'long'
          ? b.wristRight
          : lerp(b.shoulderRight, b.elbowRight, 0.75),
      armpitLeft: b.armpitLeft,
      armpitRight: b.armpitRight,
      hemLeft: lerp(b.waistLeft, b.hipLeft, item.tucked ? 0 : hem),
      hemRight: lerp(b.waistRight, b.hipRight, item.tucked ? 0 : hem),
    };
    if (item.kind === 'coat') {
      target.hemLeft = lerp(b.hipLeft, b.kneeLeft, 0.75);
      target.hemRight = lerp(b.hipRight, b.kneeRight, 0.75);
    }
  }
  const fit = item.fit === 'oversize' ? 1.12 : item.fit === 'slim' ? 0.94 : 1;
  return Object.fromEntries(
    Object.entries(target).map(([k, p]) => [
      k,
      {
        x:
          0.5 +
          (p.x - 0.5) * fit * item.placement.scale +
          item.placement.x / 100,
        y: p.y + item.placement.y / 100,
      },
    ]),
  );
}
export function mesh(
  source: Record<string, Point>,
  target: Record<string, Point>,
) {
  const keys = Object.keys(source).filter((k) => target[k]);
  const points = keys.map((k) => source[k]);
  const delaunay = Delaunator.from(
    points,
    (p) => p.x,
    (p) => p.y,
  );
  const out: { source: Point[]; target: Point[]; matrix: number[] }[] = [];
  for (let i = 0; i < delaunay.triangles.length; i += 3) {
    const ids = Array.from(delaunay.triangles.slice(i, i + 3));
    const s = ids.map((i) => source[keys[i]]),
      t = ids.map((i) => target[keys[i]]);
    const matrix = affine(s, t);
    if (matrix) out.push({ source: s, target: t, matrix });
  }
  return out;
}
