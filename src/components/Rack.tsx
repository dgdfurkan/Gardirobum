import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  SlidersHorizontal,
} from 'lucide-react';
import { assetFor, kindLabels, fitLabels } from '../lib/model';
import type { Garment } from '../lib/types';
function Hanger({ bottom = false }: { bottom?: boolean }) {
  return (
    <svg
      className="hanger-svg"
      viewBox="0 0 200 100"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={bottom ? 'wood-bottom' : 'wood'}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop stopColor="#a67650" />
          <stop offset=".38" stopColor="#81543a" />
          <stop offset=".7" stopColor="#aa7a53" />
          <stop offset="1" stopColor="#68432e" />
        </linearGradient>
        <linearGradient id="metal">
          <stop stopColor="#7f827a" />
          <stop offset=".4" stopColor="#f8f8f4" />
          <stop offset="1" stopColor="#858b80" />
        </linearGradient>
      </defs>
      <path
        d="M100 39V26c0-4 11-5 11-13 0-14-21-14-21 0"
        stroke="url(#metal)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {bottom ? (
        <>
          <path
            d="M32 64h136"
            stroke="url(#wood-bottom)"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d="M100 39 32 64m68-25 68 25"
            stroke="#8e6247"
            strokeWidth="5"
          />
          <rect x="38" y="65" width="9" height="16" rx="2" fill="#7e817a" />
          <rect x="154" y="65" width="9" height="16" rx="2" fill="#7e817a" />
        </>
      ) : (
        <>
          <path
            d="M98 39 23 72c-6 3-4 10 3 10h148c7 0 9-7 3-10l-75-33Z"
            fill="url(#wood)"
          />
          <path d="M36 75 100 47l64 28H36Z" fill="#f6f5ef" />
          <path d="M27 80h146" stroke="#c79a6d" opacity=".55" strokeWidth="2" />
        </>
      )}
    </svg>
  );
}
export function Rack({
  items,
  selected,
  focused,
  onFocus,
  onWear,
  onDetails,
  busy,
  onAdd,
}: {
  items: Garment[];
  selected: string[];
  focused: string | null;
  onFocus: (id: string) => void;
  onWear: (id: string) => void;
  onDetails: (id: string) => void;
  busy: boolean;
  onAdd: () => void;
}) {
  const [center, setCenter] = useState(() =>
      Math.max(
        0,
        items.findIndex((i) => i.id === focused),
      ),
    ),
    [hover, setHover] = useState<string | null>(null);
  const reduced = useReducedMotion();
  const start = useRef<{ x: number; y: number; index: number } | null>(null),
    drag = useRef(false),
    suppress = useRef(false);
  useEffect(() => {
    setCenter(
      Math.max(
        0,
        items.findIndex((i) => i.id === focused),
      ),
    );
    setHover(null);
  }, [items.length, items[0]?.id]);
  const active =
    items.find((i) => i.id === hover) ||
    items.find((i) => i.id === focused) ||
    items[center];
  function navigate(index: number) {
    const next = Math.max(0, Math.min(items.length - 1, index));
    setCenter(next);
    setHover(null);
    if (items[next]) onFocus(items[next].id);
  }
  const [width, setWidth] = useState(800),
    room = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new ResizeObserver((entries) =>
      setWidth(entries[0].contentRect.width),
    );
    if (room.current) observer.observe(room.current);
    return () => observer.disconnect();
  }, []);
  const spacing = width < 500 ? 105 : width < 800 ? 145 : 175;
  return (
    <div className="rack-room" ref={room}>
      <div className="rack-room-label">
        <span>ASKIDA</span>
        <span>
          {items.length
            ? String(items.findIndex((i) => i.id === active?.id) + 1).padStart(
                2,
                '0',
              )
            : '00'}{' '}
          / {String(items.length).padStart(2, '0')}
        </span>
      </div>
      <div
        className="rack-stage"
        role="group"
        tabIndex={0}
        aria-label="Askıda kıyafetler"
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            e.preventDefault();
            navigate(center + (e.key === 'ArrowRight' ? 1 : -1));
          } else if (e.key === 'Enter' && active) {
            e.preventDefault();
            onWear(active.id);
          }
        }}
        onPointerDown={(e) => {
          if (e.pointerType === 'mouse') return;
          start.current = { x: e.clientX, y: e.clientY, index: center };
          drag.current = false;
        }}
        onPointerMove={(e) => {
          if (!start.current) return;
          const dx = e.clientX - start.current.x,
            dy = e.clientY - start.current.y;
          if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy)) {
            if (!drag.current) e.currentTarget.setPointerCapture(e.pointerId);
            drag.current = true;
            suppress.current = true;
            navigate(start.current.index + Math.round(-dx / 90));
          }
        }}
        onPointerUp={(e) => {
          start.current = null;
          if (drag.current) {
            if (e.currentTarget.hasPointerCapture(e.pointerId))
              e.currentTarget.releasePointerCapture(e.pointerId);
            setTimeout(() => (suppress.current = false), 200);
          }
          drag.current = false;
        }}
        onPointerCancel={() => {
          start.current = null;
          drag.current = false;
          suppress.current = false;
        }}
      >
        <div className="chrome-rail">
          <i />
          <i />
        </div>
        {!items.length ? (
          <div className="rack-empty">
            <p>Bu askı seni bekliyor.</p>
            <button className="button outline" onClick={onAdd}>
              <Plus size={16} />
              Parça Ekle
            </button>
          </div>
        ) : (
          items.map((item, index) => {
            const delta = index - center;
            if (Math.abs(delta) > 3) return null;
            const isActive = active?.id === item.id;
            return (
              <motion.div
                key={item.id}
                className="rack-item"
                data-item-id={item.id}
                style={{ zIndex: isActive ? 20 : 10 - Math.abs(delta) }}
                initial={false}
                animate={{
                  x: delta * spacing,
                  rotateY: isActive ? 0 : delta < 0 ? 73 : -73,
                  scale: isActive ? 1 : 0.96,
                  opacity: Math.abs(delta) > 2 ? 0.35 : 1,
                }}
                transition={{ type: 'spring', stiffness: 85, damping: 19 }}
              >
                <motion.button
                  type="button"
                  className="hanging-group"
                  aria-label={
                    item.name +
                    (selected.includes(item.id)
                      ? ', kombinde'
                      : ', kombine ekle')
                  }
                  data-testid={'rack-' + item.id}
                  animate={{
                    rotateZ: reduced
                      ? 0
                      : isActive
                        ? [0, -1.7, 1.15, -0.5, 0]
                        : 0,
                  }}
                  transition={{ duration: 1.1, ease: 'easeInOut' }}
                  onPointerEnter={(e) => {
                    if (e.pointerType === 'mouse') {
                      setHover(item.id);
                      onFocus(item.id);
                    }
                  }}
                  onClick={() => {
                    if (suppress.current || busy) return;
                    onFocus(item.id);
                    onWear(item.id);
                  }}
                >
                  <Hanger bottom={item.category === 'bottom'} />
                  <img
                    className={
                      'hanging-garment ' +
                      (item.category === 'bottom' ? 'pants' : '')
                    }
                    src={
                      !isActive && item.images.side
                        ? item.images.side.src
                        : assetFor(item).src
                    }
                    alt={item.name}
                    draggable={false}
                    style={{
                      maxHeight:
                        item.kind === 'coat'
                          ? 320
                          : item.category === 'bottom'
                            ? 300
                            : 260,
                    }}
                  />
                  {selected.includes(item.id) && (
                    <span className="worn-tick">
                      <Check size={13} />
                    </span>
                  )}
                </motion.button>
              </motion.div>
            );
          })
        )}
        <div className="rack-floor-shadow" />
      </div>
      <div className="rack-selection">
        <button
          className="circle-button"
          aria-label="Önceki Parça"
          disabled={center === 0}
          onClick={() => navigate(center - 1)}
        >
          <ChevronLeft size={17} />
        </button>
        <div>
          <h2>{active?.name || 'Gardırobuna Ekle'}</h2>
          <p>
            {active
              ? [kindLabels[active.kind], active.color, fitLabels[active.fit]]
                  .filter(Boolean)
                  .join(' · ')
              : 'Mont, kaban, saat veya bir tişört.'}
          </p>
        </div>
        <button
          className="circle-button"
          aria-label="Sonraki Parça"
          disabled={center >= items.length - 1}
          onClick={() => navigate(center + 1)}
        >
          <ChevronRight size={17} />
        </button>
      </div>
      <div className="rack-actions">
        <button
          className="button dark"
          disabled={!active || busy}
          onClick={() => active && onWear(active.id)}
        >
          {active && selected.includes(active.id)
            ? 'Kombinden Çıkar'
            : 'Kombine Ekle'}
        </button>
        <button
          className="text-button"
          disabled={!active}
          onClick={() => active && onDetails(active.id)}
        >
          <SlidersHorizontal size={14} />
          Detayları Düzenle
        </button>
      </div>
      <p className="rack-hint">
        <span className="desktop-only">
          Üzerinde gezin, seçmek için tıklayın.
        </span>
        <span className="mobile-only">
          Kaydırarak gezinin, seçmek için dokunun.
        </span>
      </p>
    </div>
  );
}
