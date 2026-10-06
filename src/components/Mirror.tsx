import { useId } from 'react';
import { Camera, ScanLine, Plus } from 'lucide-react';
import type { Asset, Garment, Person } from '../lib/types';
import { assetFor } from '../lib/model';
import { garmentTargets, mesh, lerp } from '../lib/warp';
function WarpedGarment({ item, person }: { item: Garment; person: Person }) {
  const id = useId().replaceAll(':', '');
  const image = assetFor(item),
    triangles = mesh(item.anchors, garmentTargets(item, person));
  return (
    <g data-layer-id={item.id} className="warped-layer">
      <defs>
        {triangles.map((t, n) => (
          <clipPath id={id + '-' + n} key={n} clipPathUnits="userSpaceOnUse">
            <polygon
              points={t.target
                .map((p) => {
                  const center = {
                    x: t.target.reduce((n, p) => n + p.x, 0) / 3,
                    y: t.target.reduce((n, p) => n + p.y, 0) / 3,
                  };
                  return `${center.x + (p.x - center.x) * 1.015},${center.y + (p.y - center.y) * 1.015}`;
                })
                .join(' ')}
            />
          </clipPath>
        ))}
      </defs>
      {triangles.map((t, n) => (
        <g key={n} clipPath={'url(#' + id + '-' + n + ')'}>
          <image
            href={image.src}
            width="1"
            height="1"
            preserveAspectRatio="none"
            transform={`matrix(${t.matrix.join(' ')})`}
          />
        </g>
      ))}
    </g>
  );
}
function Accessory({ item, person }: { item: Garment; person: Person }) {
  const b = person.anchors,
    asset = assetFor(item);
  let x = 0.5,
    y = 0.1,
    w = 0.28,
    h = 0.1;
  const ratio = asset.height / asset.width;
  if (item.category === 'shoes') {
    const p = lerp(b.footLeft, b.footRight, 0.5);
    x = p.x;
    y = p.y;
    w = Math.abs(b.footRight.x - b.footLeft.x) + 0.26;
    h = 0.1;
  } else if (item.position === 'leftWrist' || item.position === 'rightWrist') {
    const p = item.position === 'leftWrist' ? b.wristLeft : b.wristRight;
    x = p.x;
    y = p.y;
    w = 0.075;
    h = 0.048;
  } else if (item.position === 'head') {
    x = b.head.x;
    y = b.head.y + 0.025;
    w = 0.26;
    h = 0.11;
  } else if (item.position === 'eyes') {
    x = b.eyes.x;
    y = b.eyes.y;
    w = 0.25;
    h = 0.05;
  } else if (item.position === 'neck') {
    x = 0.5;
    y = (b.neckLeft.y + b.armpitLeft.y) / 2;
    w = 0.22;
    h = 0.15;
  } else if (item.position === 'waist') {
    x = 0.5;
    y = b.waistLeft.y;
    w = b.waistRight.x - b.waistLeft.x + 0.08;
    h = 0.04;
  } else {
    x = 0.82;
    y = 0.44;
    w = 0.28;
    h = 0.2;
  }
  w *= item.placement.scale;
  h *= item.placement.scale;
  x += item.placement.x / 100;
  y += item.placement.y / 100;
  return (
    <image
      data-layer-id={item.id}
      href={asset.src}
      x={x - w / 2}
      y={y - h / 2}
      width={w}
      height={h}
      preserveAspectRatio="none"
      transform={`rotate(${item.placement.rotation} ${x} ${y})`}
    />
  );
}
export function Mirror({
  person,
  mannequin,
  items,
  result,
  onPerson,
  onTryon,
  onImportResult,
}: {
  person: Person;
  mannequin: Asset;
  items: Garment[];
  result: Asset | undefined;
  onPerson: () => void;
  onTryon: () => void;
  onImportResult: () => void;
}) {
  const photo = person.photo || mannequin;
  const order = {
    bottom: 0,
    shoes: 1,
    top: 2,
    shirt: 3,
    outerwear: 4,
    accessory: 5,
  };
  const sorted = [...items].sort(
    (a, b) => order[a.category] - order[b.category],
  );
  return (
    <aside className="mirror-panel">
      <div className="mirror-heading">
        <div>
          <p className="eyebrow">DENEME ODASI</p>
          <h2>Aynan.</h2>
        </div>
        <button
          className="icon-button"
          aria-label="Vücut Noktalarını Düzenle"
          onClick={onPerson}
        >
          <ScanLine size={20} />
        </button>
      </div>
      <div className="mirror-stage">
        <div className="mirror-arch" />
        {result ? (
          <img
            className="real-result"
            src={result.src}
            alt="Mevcut kombin için eklenen deneme sonucu"
          />
        ) : (
          <div
            className="person-frame"
            style={{ aspectRatio: photo.width + '/' + photo.height }}
          >
            <svg
              viewBox="0 0 1 1"
              preserveAspectRatio="none"
              role="img"
              aria-label="Seçtiğin kombinin fotoğraf üzerinde yerleşimi"
            >
              <image
                href={photo.src}
                x="0"
                y="0"
                width="1"
                height="1"
                preserveAspectRatio="none"
              />
              {sorted.map((i) =>
                ['top', 'shirt', 'outerwear', 'bottom'].includes(i.category) ? (
                  <WarpedGarment
                    key={i.id + ':' + i.opening + ':' + (i.activeVariant || '')}
                    item={i}
                    person={person}
                  />
                ) : (
                  <Accessory key={i.id} item={i} person={person} />
                ),
              )}
            </svg>
          </div>
        )}
        <span className="stage-badge">
          {result
            ? 'Eklediğin Deneme Sonucu'
            : person.photo
              ? person.calibrated
                ? 'Fotoğrafın · Kalibre Edildi'
                : 'Fotoğrafın · Noktaları İşaretle'
              : 'Örnek Manken'}
        </span>
      </div>
      <div className="mirror-controls">
        <button className="button outline wide" onClick={onPerson}>
          <Camera size={17} />
          {person.photo ? 'Fotoğraf Ve Vücut Noktaları' : 'Fotoğrafımı Ekle'}
        </button>
        <p className="mirror-note">
          {result
            ? 'Bu sonuç mevcut kombinle eşleştirildi.'
            : 'Fotoğraf üzerinde yerleşim önizlemesi. Gerçek kumaş ve beden ölçümü değildir.'}
        </p>
      </div>
      <button className="tryon-card" onClick={onTryon}>
        <span className="tryon-star">✦</span>
        <span>
          <strong>Gerçekçi Deneme</strong>
          <small>Kombine özel fotoğraf ve prompt paketi.</small>
        </span>
        <Plus size={19} />
      </button>
    </aside>
  );
}
