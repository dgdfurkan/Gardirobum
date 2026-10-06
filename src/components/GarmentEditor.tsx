import { useState } from 'react';
import { Plus, Trash2, ScanLine, Check } from 'lucide-react';
import type { Garment, Kind, Asset } from '../lib/types';
import {
  kindLabels,
  kindCategories,
  defaultGarmentAnchors,
  fitLabels,
  openingLabels,
  upperLabels,
  pantsLabels,
  assetFor,
  uid,
} from '../lib/model';
import { readPhoto } from '../lib/assets';
import { Choice, PhotoInput, Range, Toggle } from './ui';
import { Calibration } from './Calibration';
export function GarmentEditor({
  initial,
  onSave,
  onDelete,
  onCancel,
}: {
  initial: Garment;
  onSave: (item: Garment) => Promise<boolean>;
  onDelete?: () => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<Garment>(structuredClone(initial)),
    [tab, setTab] = useState('info'),
    [error, setError] = useState(''),
    [saving, setSaving] = useState(false);
  function patch(p: Partial<Garment>) {
    setDraft((d) => ({ ...d, ...p }));
  }
  async function upload(file: File, key: keyof Garment['images']) {
    try {
      const image = await readPhoto(file);
      setDraft((d) => ({
        ...d,
        images: { ...d.images, [key]: image },
        demo: false,
      }));
      setError('');
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function save() {
    if (!draft.name.trim()) {
      setError('Parçaya bir ad ver.');
      setTab('info');
      return;
    }
    if (!draft.images.front.src) {
      setError('Ön görünüm fotoğrafını ekle.');
      setTab('photos');
      return;
    }
    if (
      (draft.cmLength !== null &&
        (draft.cmLength < 1 || draft.cmLength > 250)) ||
      (draft.cmWidth !== null && (draft.cmWidth < 1 || draft.cmWidth > 200))
    ) {
      setError('Parça boyu 1–250 cm, en / bel 1–200 cm aralığında olmalı.');
      setTab('info');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (!(await onSave({ ...draft, name: draft.name.trim() })))
        setError(
          'Kayıt tamamlanmadı. Bilgilerin burada duruyor; tekrar deneyebilirsin.',
        );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }
  const changeKind = (value: string) => {
    const kind = value as Kind,
      category = kindCategories[kind],
      sleeve = [
        'shirt',
        'jacket',
        'coat',
        'puffer',
        'sweater',
        'hoodie',
      ].includes(kind)
        ? 'long'
        : kind === 'tshirt'
          ? 'short'
          : 'none';
    patch({
      kind,
      category,
      sleeve,
      anchors: defaultGarmentAnchors(category, sleeve),
      position: ['watch', 'smartwatch'].includes(kind)
        ? 'leftWrist'
        : kind === 'cap'
          ? 'head'
          : kind === 'glasses'
            ? 'eyes'
            : kind === 'necklace'
              ? 'neck'
              : kind === 'belt'
                ? 'waist'
                : 'bag',
    });
  };
  const watch = ['watch', 'smartwatch'].includes(draft.kind),
    warp = ['top', 'shirt', 'outerwear', 'bottom'].includes(draft.category),
    opening = ['shirt', 'outerwear'].includes(draft.category);
  return (
    <>
      <div className="editor-layout">
        <aside className="editor-preview">
          <div className="editor-image">
            <img
              src={assetFor(draft).src || undefined}
              alt={draft.name || 'Yeni parça'}
            />
            {!draft.images.front.src && (
              <PhotoInput
                label="Ön Fotoğrafı Ekle"
                onFile={(f) => upload(f, 'front')}
              />
            )}
          </div>
          <span className="pill">{kindLabels[draft.kind]}</span>
          <h3>{draft.name || 'Yeni Parçan'}</h3>
          <p>{draft.color || 'Rengini ekle'}</p>
          {draft.demo && (
            <p className="help">
              Örnek görsel. Kendi parçanın fotoğrafıyla değiştirebilirsin.
            </p>
          )}
          <div
            className="editor-tabs"
            role="tablist"
            aria-label="Parça Düzenleme"
          >
            {[
              ['info', 'Parça Bilgileri'],
              ['photos', 'Fotoğraflar'],
              ['anchors', 'Yerleşim Noktaları'],
              ...(watch ? [['variants', 'Saat & Kordonlar']] : []),
            ].map(([key, label]) => (
              <button
                role="tab"
                aria-selected={tab === key}
                className={tab === key ? 'active' : ''}
                key={key}
                onClick={() => setTab(key)}
              >
                {label}
              </button>
            ))}
          </div>
          {onDelete && (
            <button className="text-button danger" onClick={onDelete}>
              <Trash2 size={14} />
              Parçayı Sil
            </button>
          )}
        </aside>
        <div className="editor-fields">
          {tab === 'info' && (
            <>
              <label className="field">
                Parça Adı
                <input
                  aria-label="Parça Adı"
                  value={draft.name}
                  onChange={(e) => patch({ name: e.target.value })}
                  maxLength={80}
                  placeholder="Örn. Siyah Tişört"
                />
              </label>
              <div className="form-grid">
                <Choice
                  label="Parça Türü"
                  value={draft.kind}
                  options={Object.entries(kindLabels).map(([value, label]) => ({
                    value,
                    label,
                  }))}
                  onChange={changeKind}
                />
                <label className="field">
                  Renk
                  <input
                    aria-label="Renk"
                    value={draft.color}
                    maxLength={40}
                    onChange={(e) => patch({ color: e.target.value })}
                    placeholder="Örn. Siyah"
                  />
                </label>
                <Choice
                  label="Kalıp"
                  value={draft.fit}
                  options={Object.entries(fitLabels).map(([value, label]) => ({
                    value,
                    label,
                  }))}
                  onChange={(v) => patch({ fit: v as Garment['fit'] })}
                />
                <Choice
                  label="Uzunluk"
                  value={draft.length}
                  options={[
                    { value: 'regular', label: 'Normal' },
                    { value: 'long', label: 'Uzun' },
                    { value: 'short', label: 'Kısa' },
                  ]}
                  onChange={(v) => patch({ length: v as Garment['length'] })}
                />
                <Choice
                  label="Yaka"
                  value={draft.neck}
                  options={[
                    'Bisiklet Yaka',
                    'Gömlek Yaka',
                    'Boğazlı',
                    'V Yaka',
                    'Kapüşonlu',
                    'Uygulanmaz',
                  ].map((label) => ({ value: label, label }))}
                  onChange={(v) => patch({ neck: v })}
                />
                <Choice
                  label="Kol"
                  value={draft.sleeve}
                  options={[
                    { value: 'short', label: 'Kısa Kol' },
                    { value: 'long', label: 'Uzun Kol' },
                    { value: 'none', label: 'Uygulanmaz' },
                  ]}
                  onChange={(v) =>
                    patch({
                      sleeve: v as Garment['sleeve'],
                      anchors: defaultGarmentAnchors(draft.category, v),
                    })
                  }
                />
                <label className="field">
                  Beden
                  <input
                    aria-label="Beden"
                    value={draft.size}
                    onChange={(e) => patch({ size: e.target.value })}
                    placeholder="Örn. L"
                  />
                </label>
                {opening && (
                  <Choice
                    label="Düğme / Fermuar"
                    value={draft.opening}
                    options={Object.entries(openingLabels).map(
                      ([value, label]) => ({ value, label }),
                    )}
                    onChange={(v) =>
                      patch({ opening: v as Garment['opening'] })
                    }
                  />
                )}
              </div>
              <div className="form-grid">
                <label className="field">
                  Parça Boyu (cm)
                  <input
                    type="number"
                    aria-label="Parça Boyu"
                    value={draft.cmLength ?? ''}
                    onChange={(e) =>
                      patch({
                        cmLength: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                    min={1}
                    max={250}
                    placeholder="İsteğe bağlı"
                  />
                </label>
                <label className="field">
                  En / Bel (cm)
                  <input
                    type="number"
                    aria-label="Parça Eni"
                    value={draft.cmWidth ?? ''}
                    onChange={(e) =>
                      patch({
                        cmWidth: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    min={1}
                    max={200}
                    placeholder="İsteğe bağlı"
                  />
                </label>
              </div>
              {['top', 'shirt'].includes(draft.category) && (
                <Toggle
                  label="Pantolonun İçine Sok"
                  checked={draft.tucked}
                  onChange={(v) => patch({ tucked: v })}
                />
              )}{' '}
              {draft.category === 'accessory' && (
                <Choice
                  label="Aksesuar Konumu"
                  value={draft.position}
                  options={[
                    ['leftWrist', 'Fotoğraftaki Sol Bilek'],
                    ['rightWrist', 'Fotoğraftaki Sağ Bilek'],
                    ['head', 'Baş'],
                    ['eyes', 'Göz'],
                    ['neck', 'Boyun'],
                    ['waist', 'Bel'],
                    ['bag', 'Çanta'],
                  ].map(([value, label]) => ({ value, label }))}
                  onChange={(v) =>
                    patch({ position: v as Garment['position'] })
                  }
                />
              )}
              <label className="field">
                Parçanın Detayları
                <textarea
                  aria-label="Parçanın Detayları"
                  value={draft.notes}
                  onChange={(e) => patch({ notes: e.target.value })}
                  maxLength={800}
                  placeholder="Düşük omuz, uzun etek, yırtık detayları…"
                />
              </label>
            </>
          )}
          {tab === 'photos' && (
            <>
              <h3>Her Görünüm Kendi Fotoğrafıyla</h3>
              <p className="help">
                Şeffaf PNG kullan. Arka plan kendiliğinden silinmez; görselleri
                birlikte hazırlayacağız.
              </p>
              <div className="photo-grid">
                {(
                  [
                    'front',
                    'back',
                    'side',
                    ...(opening ? ['open', 'partial'] : []),
                  ] as (keyof Garment['images'])[]
                ).map((key) => (
                  <PhotoInput
                    key={key}
                    label={
                      {
                        front: 'Ön Görünüm',
                        back: 'Arka Görünüm',
                        side: 'Yan Görünüm',
                        open: 'Açık Hâli',
                        partial: 'Yarı Kapalı Hâli',
                      }[key]
                    }
                    thumbnail={draft.images[key]?.src}
                    onFile={(f) => upload(f, key)}
                  />
                ))}
              </div>
              {opening &&
                !draft.images[draft.opening as keyof Garment['images']] &&
                draft.opening !== 'closed' && (
                  <p className="inline-note">
                    Seçilen düğme görünümünün fotoğrafı eksik. Önizleme mevcut
                    ön fotoğrafı kullanır.
                  </p>
                )}
            </>
          )}
          {tab === 'anchors' && (
            <>
              <h3>
                {warp ? 'Kıyafetin Yerleşim Noktaları' : 'Aksesuarın Yerleşimi'}
              </h3>
              <p className="help">
                {warp
                  ? 'Omuz, kol ve etek noktalarını bu parçada işaretle. Vücut noktalarınla eşleştirilerek yerleşir.'
                  : 'Aksesuar, seçtiğin vücut noktasına yerleşir. İnce ayarı aşağıdan yapabilirsin.'}
              </p>
              {warp && draft.images.front.src && (
                <Calibration
                  photo={assetFor(draft)}
                  points={draft.anchors}
                  labels={
                    draft.category === 'bottom' ? pantsLabels : upperLabels
                  }
                  defaultPoints={defaultGarmentAnchors(
                    draft.category,
                    draft.sleeve,
                  )}
                  onChange={(anchors) => patch({ anchors })}
                  mode="garment"
                />
              )}
              <div className="placement-grid">
                <Range
                  label="Yatay İnce Ayar"
                  value={draft.placement.x}
                  min={-30}
                  max={30}
                  step={0.5}
                  suffix="%"
                  onChange={(x) =>
                    patch({ placement: { ...draft.placement, x } })
                  }
                />
                <Range
                  label="Dikey İnce Ayar"
                  value={draft.placement.y}
                  min={-30}
                  max={30}
                  step={0.5}
                  suffix="%"
                  onChange={(y) =>
                    patch({ placement: { ...draft.placement, y } })
                  }
                />
                <Range
                  label="Ölçek"
                  value={draft.placement.scale}
                  min={0.5}
                  max={1.6}
                  step={0.01}
                  onChange={(scale) =>
                    patch({ placement: { ...draft.placement, scale } })
                  }
                />
                {!warp && (
                  <Range
                    label="Açı"
                    value={draft.placement.rotation}
                    min={-90}
                    max={90}
                    suffix="°"
                    onChange={(rotation) =>
                      patch({ placement: { ...draft.placement, rotation } })
                    }
                  />
                )}
              </div>
            </>
          )}
          {tab === 'variants' && (
            <>
              <h3>Saat Ve Kordon Seçenekleri</h3>
              <p className="help">
                Her kordon için saatin o kordonla çekilmiş fotoğrafını ekle.
                Sadece renk değiştirerek yeni bir saat üretmeyiz.
              </p>
              {draft.variants.map((v, index) => (
                <div className="variant-editor" key={v.id}>
                  <PhotoInput
                    small
                    label={v.name || 'Seçenek Fotoğrafı'}
                    thumbnail={v.image?.src}
                    onFile={async (file) => {
                      try {
                        const image = await readPhoto(file);
                        setDraft((d) => ({
                          ...d,
                          variants: d.variants.map((a) =>
                            a.id === v.id ? { ...a, image } : a,
                          ),
                        }));
                      } catch (e) {
                        setError((e as Error).message);
                      }
                    }}
                  />
                  <div>
                    <label className="field">
                      Seçenek Adı
                      <input
                        aria-label={'Kordon Adı ' + (index + 1)}
                        value={v.name}
                        placeholder="Örn. Siyah Kordon"
                        onChange={(e) =>
                          patch({
                            variants: draft.variants.map((a) =>
                              a.id === v.id
                                ? { ...a, name: e.target.value }
                                : a,
                            ),
                          })
                        }
                      />
                    </label>
                    <input
                      aria-label={'Kordon Rengi ' + (index + 1)}
                      value={v.color}
                      placeholder="Renk"
                      onChange={(e) =>
                        patch({
                          variants: draft.variants.map((a) =>
                            a.id === v.id ? { ...a, color: e.target.value } : a,
                          ),
                        })
                      }
                    />
                  </div>
                  <button
                    className="icon-button danger"
                    aria-label="Kordonu Sil"
                    onClick={() =>
                      patch({
                        variants: draft.variants.filter((a) => a.id !== v.id),
                        activeVariant:
                          draft.activeVariant === v.id
                            ? null
                            : draft.activeVariant,
                      })
                    }
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                className="button outline"
                onClick={() =>
                  patch({
                    variants: [
                      ...draft.variants,
                      { id: uid(), name: '', color: '', image: null },
                    ],
                  })
                }
              >
                <Plus size={16} />
                Kordon / Saat Seçeneği Ekle
              </button>
              <div className="variant-options">
                <button
                  className={!draft.activeVariant ? 'active' : ''}
                  onClick={() => patch({ activeVariant: null })}
                >
                  Ana Saat
                </button>
                {draft.variants.map((v) => (
                  <button
                    disabled={!v.image}
                    className={draft.activeVariant === v.id ? 'active' : ''}
                    key={v.id}
                    onClick={() => patch({ activeVariant: v.id })}
                  >
                    {v.name || 'Yeni Kordon'}
                    {draft.activeVariant === v.id && <Check size={14} />}
                  </button>
                ))}
              </div>
            </>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
      <div className="modal-footer">
        <button className="button outline" onClick={onCancel}>
          Vazgeç
        </button>
        <button className="button primary" onClick={save} disabled={saving}>
          {saving ? 'Kaydediliyor…' : 'Parçayı Kaydet'}
        </button>
      </div>
    </>
  );
}
