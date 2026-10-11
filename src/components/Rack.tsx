import { useEffect, useRef, useState, type CSSProperties } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  ArrowUpRight,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { assetFor, kindLabels, fitLabels } from '../lib/model';
import type { Asset, Garment, Point } from '../lib/types';

function spriteStyle(
  p: Point,
  asset: Asset,
  frame: number,
  scale = 1,
): CSSProperties {
  return {
    width: `${scale * 100}%`,
    height: 'auto',
    left: `${50 - p.x * scale * 100}%`,
    top: (-p.y * frame * scale * asset.height) / asset.width,
    transformOrigin: `${p.x * 100}% ${p.y * 100}%`,
  };
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
  const hanging = items.filter(
    (i) => !['shoes', 'accessory'].includes(i.category),
  );
  const shelf = items.filter((i) =>
    ['shoes', 'accessory'].includes(i.category),
  );
  const signature = hanging.map((i) => i.id).join('|');
  const room = useRef<HTMLDivElement>(null),
    stage = useRef<HTMLDivElement>(null);
  const groups = useRef(new Map<string, HTMLButtonElement>());
  const pointer = useRef<number | null>(null),
    activeRef = useRef(0);
  const wake = useRef(() => {});
  const dragStart = useRef<number | null>(null),
    scrolling = useRef(false);
  const [width, setWidth] = useState(800),
    [activeId, setActiveId] = useState(focused),
    [detailId, setDetailId] = useState<string | null>(null);
  const frame = width < 520 ? 224 : Math.min(284, Math.max(224, width * 0.32));
  const spacing = Math.max(
    78,
    Math.min(frame * 0.47, (width - frame) / Math.max(1, hanging.length - 1)),
  );
  const mobile = width < 520;
  const trackWidth = Math.max(
    width,
    (hanging.length - 1) * spacing + frame + 48,
  );
  const padding =
    mobile || trackWidth > width
      ? width / 2
      : (width - (hanging.length - 1) * spacing) / 2;
  const fullWidth =
    mobile || trackWidth > width
      ? width + Math.max(0, hanging.length - 1) * spacing
      : trackWidth;
  const active = items.find((i) => i.id === activeId) || hanging[0] || shelf[0];
  const detail = items.find((i) => i.id === detailId);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width),
    );
    if (stage.current) observer.observe(stage.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const index = Math.max(
      0,
      hanging.findIndex((i) => i.id === focused),
    );
    activeRef.current = index;
    setActiveId(hanging[index]?.id || shelf[0]?.id || null);
    pointer.current = null;
    const s = stage.current;
    if (s) s.scrollLeft = Math.max(0, padding + index * spacing - width / 2);
    // Category changes reset the rail; wearing a garment preserves its position.
  }, [signature, width]);

  useEffect(() => {
    const s = stage.current;
    if (!s || !hanging.length || detailId) return;
    const values = hanging.map(() => 0);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let raf = 0,
      last = 0,
      inView = true;
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView && !raf) raf = requestAnimationFrame(draw);
    });
    observer.observe(s);
    function draw(now: number) {
      raf = 0;
      if (!inView || document.hidden) return;
      const dt = Math.min(40, last ? now - last : 16) / 1000;
      last = now;
      const follow = reduced.matches ? 1 : 1 - Math.exp(-13 * dt);
      for (let i = 0; i < hanging.length; i++) {
        const b = groups.current.get(hanging[i].id);
        if (!b) continue;
        const x = padding + i * spacing - s!.scrollLeft;
        if (x < -frame || x > width + frame) continue;
        const distance = Math.abs(
          x -
            (pointer.current ??
              (mobile || scrolling.current
                ? width / 2
                : padding + activeRef.current * spacing - s!.scrollLeft)),
        );
        const target = Math.max(0, 1 - distance / (spacing * 1.12));
        values[i] += (target - values[i]) * follow;
        const p = values[i],
          ease = p * p * (3 - 2 * p);
        const swing = reduced.matches
          ? 0
          : Math.sin(now / 1350 + i * 1.8) * (1 - ease) * 0.85 +
            Math.sin(now / 620 + i) * ease * 0.45;
        const garment = b.querySelector<HTMLElement>('.garment-motion');
        if (garment)
          garment.style.transform = `translateZ(0) rotate(${swing.toFixed(3)}deg) scale(${(1 + ease * 0.09).toFixed(4)})`;
        b.parentElement!.style.zIndex = String(10 + Math.round(ease * 60));
        const front = b.querySelector<HTMLElement>('.rack-front');
        const side = b.querySelector<HTMLElement>('.rack-side');
        if (front && side) {
          const reveal = Math.max(0, Math.min(1, (ease - 0.13) / 0.66));
          front.style.opacity = String(reveal);
          front.style.transform = `perspective(900px) rotateY(${((1 - ease) * 48).toFixed(2)}deg) scaleX(${(0.66 + ease * 0.34).toFixed(4)})`;
          side.style.opacity = String(
            1 - Math.max(0, Math.min(1, (ease - 0.28) / 0.63)),
          );
          side.style.transform = `scaleX(${(1 + ease * 0.32).toFixed(4)})`;
        }
      }
      if (!reduced.matches) raf = requestAnimationFrame(draw);
    }
    const resume = () => {
      last = 0;
      if (!document.hidden && !raf) raf = requestAnimationFrame(draw);
    };
    wake.current = resume;
    document.addEventListener('visibilitychange', resume);
    s.addEventListener('pointermove', resume);
    s.addEventListener('scroll', resume);
    s.addEventListener('keydown', resume);
    reduced.addEventListener('change', resume);
    raf = requestAnimationFrame(draw);
    return () => {
      wake.current = () => {};
      cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener('visibilitychange', resume);
      s.removeEventListener('pointermove', resume);
      s.removeEventListener('scroll', resume);
      s.removeEventListener('keydown', resume);
      reduced.removeEventListener('change', resume);
    };
  }, [signature, width, frame, spacing, padding, mobile, detailId]);

  useEffect(() => {
    const index = hanging.findIndex((item) => item.id === focused);
    if (index < 0 || hanging[activeRef.current]?.id === focused) return;
    activeRef.current = index;
    setActiveId(focused);
    pointer.current = null;
    stage.current?.scrollTo({
      left: Math.max(0, padding + index * spacing - width / 2),
      behavior: 'instant',
    });
    wake.current();
  }, [focused]);

  function focusIndex(index: number, scroll = true) {
    const next = Math.max(0, Math.min(hanging.length - 1, index));
    activeRef.current = next;
    setActiveId(hanging[next]?.id || null);
    if (hanging[next]) onFocus(hanging[next].id);
    pointer.current = null;
    wake.current();
    if (scroll)
      stage.current?.scrollTo({
        left: Math.max(0, padding + next * spacing - width / 2),
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'instant'
          : 'smooth',
      });
  }
  function openPiece(item: Garment, index?: number) {
    if (busy) return;
    if (
      dragStart.current !== null &&
      Math.abs((stage.current?.scrollLeft || 0) - dragStart.current) > 10
    )
      return;
    if (
      mobile &&
      index !== undefined &&
      Math.abs(
        padding +
          index * spacing -
          (stage.current?.scrollLeft || 0) -
          width / 2,
      ) >
        spacing * 0.45
    ) {
      focusIndex(index);
      return;
    }
    setActiveId(item.id);
    onFocus(item.id);
    setDetailId(item.id);
  }

  return (
    <Dialog.Root open={!!detail} onOpenChange={(v) => !v && setDetailId(null)}>
      <div
        className={
          'rack-room showroom' +
          (!hanging.length && shelf.length ? ' shelf-only' : '') +
          (detail ? ' detail-open' : '')
        }
        ref={room}
      >
        <div className="rack-room-label">
          <span>
            <i className="live-dot" /> KOLEKSİYONUN, CANLI.
          </span>
          <span>
            {String(items.findIndex((i) => i.id === active?.id) + 1).padStart(
              2,
              '0',
            )}{' '}
            / {String(items.length).padStart(2, '0')}
          </span>
        </div>
        <div className="showroom-scene">
          <div className="chrome-rail">
            <i />
            <i />
          </div>
          <div
            ref={stage}
            className="rack-stage"
            style={{ height: frame * 1.5 + 32 }}
            role="group"
            tabIndex={0}
            aria-label="Askıda kıyafetler"
            onKeyDown={(e) => {
              if (['ArrowRight', 'ArrowLeft'].includes(e.key)) {
                e.preventDefault();
                focusIndex(
                  activeRef.current + (e.key === 'ArrowRight' ? 1 : -1),
                );
              } else if (e.key === 'Enter' && active) {
                e.preventDefault();
                openPiece(active);
              }
            }}
            onPointerMove={(e) => {
              if (e.pointerType !== 'mouse') return;
              dragStart.current = null;
              scrolling.current = false;
              pointer.current =
                e.clientX - e.currentTarget.getBoundingClientRect().left;
              const idx = Math.max(
                0,
                Math.min(
                  hanging.length - 1,
                  Math.round(
                    (pointer.current + e.currentTarget.scrollLeft - padding) /
                      spacing,
                  ),
                ),
              );
              if (idx !== activeRef.current) {
                activeRef.current = idx;
                setActiveId(hanging[idx]?.id || null);
              }
            }}
            onPointerLeave={() => {
              pointer.current = null;
              wake.current();
            }}
            onPointerDown={(e) => {
              if (e.pointerType !== 'mouse') {
                pointer.current = null;
                scrolling.current = true;
                dragStart.current = e.currentTarget.scrollLeft;
              }
            }}
            onScroll={(e) => {
              if (!mobile && pointer.current !== null) return;
              scrolling.current = true;
              const idx = Math.max(
                0,
                Math.min(
                  hanging.length - 1,
                  Math.round(
                    (e.currentTarget.scrollLeft + width / 2 - padding) /
                      spacing,
                  ),
                ),
              );
              if (idx !== activeRef.current) {
                activeRef.current = idx;
                setActiveId(hanging[idx]?.id || null);
              }
            }}
          >
            <div
              className="rack-track"
              style={
                {
                  width: fullWidth,
                  '--rack-frame': `${frame}px`,
                } as CSSProperties
              }
            >
              {hanging.map((item, index) => (
                <div
                  className="rack-item"
                  data-item-id={item.id}
                  key={item.id}
                  style={{
                    left: padding + index * spacing - frame / 2,
                    width: frame,
                    height: frame * 1.5,
                  }}
                >
                  <button
                    ref={(el) => {
                      if (el) groups.current.set(item.id, el);
                      else groups.current.delete(item.id);
                    }}
                    className={
                      'hanging-group' +
                      (item.rack ? ' prepared' : ' unprepared')
                    }
                    data-testid={'rack-' + item.id}
                    aria-label={item.name + ', incele'}
                    onClick={() => openPiece(item, index)}
                  >
                    <span className="garment-motion">
                      {item.rack ? (
                        <>
                          {item.rack.side && (
                            <img
                              className="rack-sprite rack-side"
                              src={item.rack.side.src}
                              style={spriteStyle(
                                item.rack.sidePivot,
                                item.rack.side,
                                frame,
                                item.rack.sideScale,
                              )}
                              alt=""
                              draggable={false}
                              decoding="async"
                            />
                          )}
                          <img
                            className="rack-sprite rack-front"
                            src={item.rack.front.src}
                            style={spriteStyle(
                              item.rack.frontPivot,
                              item.rack.front,
                              frame,
                              item.rack.frontScale,
                            )}
                            alt={item.name}
                            draggable={false}
                            decoding="async"
                          />
                        </>
                      ) : (
                        <img
                          className="rack-flat"
                          src={assetFor(item).src}
                          alt={item.name}
                          draggable={false}
                          decoding="async"
                        />
                      )}
                      {selected.includes(item.id) && (
                        <span className="worn-tick">
                          <Check size={12} />
                        </span>
                      )}
                    </span>
                  </button>
                </div>
              ))}
              {!hanging.length && !shelf.length && (
                <div className="rack-empty">
                  <p>Bu askı seni bekliyor.</p>
                  <button className="button outline" onClick={onAdd}>
                    <Plus size={16} />
                    Parça Ekle
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="rack-floor-shadow" />
        </div>
        {!!shelf.length && (
          <div
            className="accessory-shelf"
            aria-label="Ayakkabı ve aksesuar rafı"
          >
            {shelf.map((item) => (
              <button
                key={item.id}
                data-testid={'rack-' + item.id}
                aria-label={item.name + ', incele'}
                onClick={() => openPiece(item)}
              >
                <img
                  src={assetFor(item).src}
                  alt={item.name}
                  draggable={false}
                  decoding="async"
                />
                {selected.includes(item.id) && <Check size={12} />}
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        )}
        <div className="rack-selection">
          <button
            className="circle-button"
            aria-label="Önceki Parça"
            disabled={!hanging.length || active?.id === hanging[0]?.id}
            onClick={() => focusIndex(activeRef.current - 1)}
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
                : 'Sana ait parçalarla başla.'}
            </p>
          </div>
          <button
            className="circle-button"
            aria-label="Sonraki Parça"
            disabled={
              !hanging.length || active?.id === hanging[hanging.length - 1]?.id
            }
            onClick={() => focusIndex(activeRef.current + 1)}
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
            onClick={() => active && setDetailId(active.id)}
          >
            Parçayı İncele <ArrowUpRight size={14} />
          </button>
        </div>
        <p className="rack-hint">
          <span className="desktop-only">
            İmlecinle gez. Bir parçayı yakından tanı.
          </span>
          <span className="mobile-only">Kaydır. Ortadaki parçaya dokun.</span>
        </p>
        {detail && (
          <Dialog.Portal container={room.current}>
            <Dialog.Overlay className="rack-detail-scrim" />
            <Dialog.Content
              className="rack-detail"
              onCloseAutoFocus={(e) => {
                e.preventDefault();
                if (detailId)
                  groups.current.get(detailId)?.focus({ preventScroll: true });
              }}
            >
              <Dialog.Close
                className="rack-detail-close text-button"
                aria-label="Askıya Dön"
              >
                <ChevronLeft size={16} /> Askıya Dön <X size={16} />
              </Dialog.Close>
              <div className="rack-detail-image">
                <img
                  src={detail.rack?.front.src || assetFor(detail).src}
                  alt={detail.name}
                />
              </div>
              <div className="rack-detail-copy">
                <p className="eyebrow">SENİN GARDIROBUNDAN</p>
                <Dialog.Title>{detail.name}</Dialog.Title>
                <Dialog.Description>
                  {detail.color} · {kindLabels[detail.kind]}
                </Dialog.Description>
                <div className="piece-spec">
                  <span>
                    Kalıp<strong>{fitLabels[detail.fit]}</strong>
                  </span>
                  <span>
                    Beden<strong>{detail.size || 'Belirtilmedi'}</strong>
                  </span>
                  <span>
                    Yaka<strong>{detail.neck}</strong>
                  </span>
                </div>
                {detail.notes && <p className="piece-notes">{detail.notes}</p>}
                <button
                  className="button dark wide"
                  disabled={busy}
                  onClick={() => onWear(detail.id)}
                >
                  {selected.includes(detail.id) ? (
                    <>
                      <Check size={16} /> Kombinden Çıkar
                    </>
                  ) : (
                    <>
                      Bu Parçayı Giy <ArrowUpRight size={16} />
                    </>
                  )}
                </button>
                <button
                  className="text-button"
                  onClick={() => {
                    setDetailId(null);
                    onDetails(detail.id);
                  }}
                >
                  <SlidersHorizontal size={14} /> Detayları Düzenle
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </div>
    </Dialog.Root>
  );
}
