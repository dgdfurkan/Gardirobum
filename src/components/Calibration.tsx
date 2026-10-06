import { useRef, useState } from 'react';
import { Move, RotateCcw, Check } from 'lucide-react';
import type { Asset, Point } from '../lib/types';
export function Calibration({
  photo,
  points,
  labels,
  onChange,
  defaultPoints,
  mode = 'body',
}: {
  photo: Asset;
  points: Record<string, Point>;
  labels: Record<string, string>;
  onChange: (points: Record<string, Point>) => void;
  defaultPoints: Record<string, Point>;
  mode?: 'body' | 'garment';
}) {
  const [active, setActive] = useState(Object.keys(labels)[0]),
    [marked, setMarked] = useState(new Set<string>());
  const dragging = useRef<string | null>(null),
    canvas = useRef<HTMLDivElement>(null);
  function place(event: React.PointerEvent, key: string) {
    if (!canvas.current) return;
    const r = canvas.current.getBoundingClientRect();
    onChange({
      ...points,
      [key]: {
        x: Math.max(0, Math.min(1, (event.clientX - r.left) / r.width)),
        y: Math.max(0, Math.min(1, (event.clientY - r.top) / r.height)),
      },
    });
    setMarked(new Set([...marked, key]));
  }
  return (
    <div className="calibration">
      <div className="calibration-work">
        <div
          className="calibration-canvas"
          ref={canvas}
          style={{
            aspectRatio: photo.width + '/' + photo.height,
            width: `min(100%, calc(var(--point-height, 430px) * ${photo.width / photo.height}))`,
            height: 'auto',
          }}
          onPointerDown={(e) => {
            if ((e.target as Element).closest('[data-anchor]')) return;
            place(e, active);
          }}
          onPointerMove={(e) => {
            if (dragging.current) place(e, dragging.current);
          }}
        >
          <img
            src={photo.src}
            alt={
              mode === 'body'
                ? 'Kalibrasyon için kişi fotoğrafı'
                : 'Kalibrasyon için kıyafet fotoğrafı'
            }
            draggable={false}
          />
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="anchor-lines"
            aria-hidden="true"
          >
            {[
              ['shoulderLeft', 'shoulderRight'],
              ['shoulderLeft', 'armpitLeft'],
              ['shoulderRight', 'armpitRight'],
              ['shoulderLeft', 'sleeveLeft'],
              ['shoulderRight', 'sleeveRight'],
              ['waistLeft', 'waistRight'],
              ['hemLeft', 'hemRight'],
              ['shoulderLeft', 'elbowLeft'],
              ['shoulderRight', 'elbowRight'],
              ['elbowLeft', 'wristLeft'],
              ['elbowRight', 'wristRight'],
              ['hipLeft', 'kneeLeft'],
              ['hipRight', 'kneeRight'],
              ['kneeLeft', 'ankleLeft'],
              ['kneeRight', 'ankleRight'],
            ]
              .filter(([a, b]) => points[a] && points[b])
              .map(([a, b]) => (
                <line
                  key={a + b}
                  x1={points[a].x * 100}
                  y1={points[a].y * 100}
                  x2={points[b].x * 100}
                  y2={points[b].y * 100}
                />
              ))}
          </svg>
          {Object.entries(labels).map(([key, label], index) => (
            <button
              type="button"
              key={key}
              data-anchor={key}
              className={'anchor-point ' + (active === key ? 'active' : '')}
              style={{
                left: points[key]?.x * 100 + '%',
                top: points[key]?.y * 100 + '%',
              }}
              aria-label={label + ' noktasını taşı'}
              onPointerDown={(e) => {
                e.stopPropagation();
                e.currentTarget.setPointerCapture(e.pointerId);
                dragging.current = key;
                setActive(key);
              }}
              onPointerUp={(e) => {
                dragging.current = null;
                e.currentTarget.releasePointerCapture(e.pointerId);
              }}
              onPointerCancel={() => (dragging.current = null)}
              onKeyDown={(e) => {
                const delta: { [key: string]: Point } = {
                  ArrowLeft: { x: -0.005, y: 0 },
                  ArrowRight: { x: 0.005, y: 0 },
                  ArrowUp: { x: 0, y: -0.005 },
                  ArrowDown: { x: 0, y: 0.005 },
                };
                if (delta[e.key]) {
                  e.preventDefault();
                  const d = delta[e.key],
                    p = points[key];
                  onChange({
                    ...points,
                    [key]: {
                      x: Math.max(0, Math.min(1, p.x + d.x)),
                      y: Math.max(0, Math.min(1, p.y + d.y)),
                    },
                  });
                }
              }}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <p className="help">
          <Move size={13} />
          Noktayı sürükle veya sağdan seçip fotoğrafa dokun.
        </p>
      </div>
      <div className="calibration-list">
        <p className="eyebrow">
          {mode === 'body'
            ? 'FOTOĞRAFTA GÖRÜNEN YÖNE GÖRE'
            : 'KIYAFETİN ÖN YÜZÜ'}
        </p>
        {Object.entries(labels).map(([key, label], index) => (
          <button
            type="button"
            className={active === key ? 'active' : ''}
            key={key}
            onClick={() => setActive(key)}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            {label}
            {marked.has(key) && <Check size={14} />}
          </button>
        ))}
        <button
          type="button"
          className="reset-points"
          onClick={() => {
            onChange(structuredClone(defaultPoints));
            setMarked(new Set());
          }}
        >
          <RotateCcw size={14} />
          Noktaları Sıfırla
        </button>
      </div>
    </div>
  );
}
