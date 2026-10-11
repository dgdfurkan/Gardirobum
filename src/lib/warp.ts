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
  if (!out.length) return out;
  // Calibration landmarks lie inside the silhouette. Extend the mesh to the
  // image perimeter so sleeves and curved shoulders are never cut at its hull.
  const edgeDistance = (p: Point, a: Point, b: Point) => {
    const dx = b.x - a.x,
      dy = b.y - a.y;
    const t = Math.max(
      0,
      Math.min(
        1,
        ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1),
      ),
    );
    return (p.x - a.x - t * dx) ** 2 + (p.y - a.y - t * dy) ** 2;
  };
  const sourcePoints = [...points],
    targetPoints = keys.map((k) => target[k]);
  for (let n = 0; n < 4; n++) {
    const t = n / 4;
    for (const p of [
      { x: t, y: 0 },
      { x: 1, y: t },
      { x: 1 - t, y: 1 },
      { x: 0, y: 1 - t },
    ]) {
      if (
        sourcePoints.some(
          (q) => Math.abs(q.x - p.x) + Math.abs(q.y - p.y) < 1e-8,
        )
      )
        continue;
      const closest = out.reduce(
        (best, triangle) => {
          const distance = Math.min(
            ...triangle.source.map((a, i) =>
              edgeDistance(p, a, triangle.source[(i + 1) % 3]),
            ),
          );
          return distance < best.distance
            ? { distance, matrix: triangle.matrix }
            : best;
        },
        { distance: Infinity, matrix: out[0].matrix },
      );
      const m = closest.matrix;
      sourcePoints.push(p);
      targetPoints.push({
        x: m[0] * p.x + m[2] * p.y + m[4],
        y: m[1] * p.x + m[3] * p.y + m[5],
      });
    }
  }
  const complete = Delaunator.from(
    sourcePoints,
    (p) => p.x,
    (p) => p.y,
  );
  const result: typeof out = [];
  for (let n = 0; n < complete.triangles.length; n += 3) {
    const ids = Array.from(complete.triangles.slice(n, n + 3));
    const s = ids.map((i) => sourcePoints[i]),
      t = ids.map((i) => targetPoints[i]);
    const matrix = affine(s, t);
    if (matrix) result.push({ source: s, target: t, matrix });
  }
  return result;
}
