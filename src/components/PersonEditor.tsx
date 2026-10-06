import { useState } from 'react';
import type { Asset, Person } from '../lib/types';
import { bodyLabels, defaultBody } from '../lib/model';
import { readPhoto } from '../lib/assets';
import { Calibration } from './Calibration';
import { PhotoInput } from './ui';
export function PersonEditor({
  initial,
  mannequin,
  onSave,
  onCancel,
}: {
  initial: Person;
  mannequin: Asset;
  onSave: (p: Person) => Promise<boolean>;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(structuredClone(initial)),
    [error, setError] = useState(''),
    [saving, setSaving] = useState(false);
  return (
    <>
      <div className="person-editor">
        <div className="person-setup">
          <PhotoInput
            label={
              draft.photo ? 'Fotoğrafı Değiştir' : 'Tam Boy Fotoğrafını Ekle'
            }
            thumbnail={draft.photo?.src}
            onFile={async (file) => {
              try {
                const photo = await readPhoto(file);
                setDraft((d) => ({
                  ...d,
                  photo,
                  anchors: structuredClone(defaultBody),
                  calibrated: false,
                }));
                setError('');
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          />
          <label className="field">
            Boyun (cm)
            <input
              type="number"
              aria-label="Boyun"
              value={draft.height ?? ''}
              min={100}
              max={240}
              placeholder="İsteğe bağlı"
              onChange={(e) =>
                setDraft({
                  ...draft,
                  height: e.target.value ? Number(e.target.value) : null,
                })
              }
            />
          </label>
          <p className="help">
            Tripodla önden, tam boy bir fotoğraf çek. Başın ve ayakların
            kadrajda olsun; kollarını gövdenden biraz ayır. Şort veya boxer
            temel görüntü olabilir.
          </p>
        </div>
        <Calibration
          photo={draft.photo || mannequin}
          points={draft.anchors}
          labels={bodyLabels}
          defaultPoints={defaultBody}
          onChange={(anchors) => setDraft({ ...draft, anchors })}
        />
        <p className="inline-note">
          Sol ve sağ etiketleri fotoğrafta görünen yöne göredir. Bu noktalar
          kıyafet yerleşimini yönlendirir; fiziksel beden ölçümü yapmaz.
        </p>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </div>
      <div className="modal-footer">
        <button className="button outline" onClick={onCancel}>
          Vazgeç
        </button>
        <button
          className="button primary"
          disabled={saving}
          onClick={async () => {
            if (
              draft.height !== null &&
              (draft.height < 100 || draft.height > 240)
            ) {
              setError('Boyunu 100–240 cm aralığında gir.');
              return;
            }
            setSaving(true);
            if (
              !(await onSave({
                ...draft,
                calibrated: !!draft.photo,
                revision: draft.revision + 1,
              }))
            )
              setError('Noktalar kaydedilemedi. Tekrar deneyebilirsin.');
            setSaving(false);
          }}
        >
          {saving ? 'Kaydediliyor…' : 'Fotoğrafı Ve Noktaları Kaydet'}
        </button>
      </div>
    </>
  );
}
