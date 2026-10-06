import { useEffect, useRef, useState } from 'react';
import {
  Check,
  Plus,
  Shuffle,
  Download,
  ArrowUpRight,
  X,
  Trash2,
  Save,
  ScanLine,
  LoaderCircle,
  FolderOpen,
} from 'lucide-react';
import type { Wardrobe, Garment, Asset, Category, Person } from './lib/types';
import {
  assetFor,
  categoryLabels,
  fitLabels,
  newGarment,
  selectItem,
  selectedSnapshot,
  randomOutfit,
  uid,
  outfitSettings,
  restoreOutfit,
  resultKey,
  validateState,
  openingLabels,
} from './lib/model';
import { loadDemo, readPhoto } from './lib/assets';
import { readState, writeState } from './lib/storage';
import { download, promptFor, tryonPackage } from './lib/export';
import { Rack } from './components/Rack';
import { Mirror } from './components/Mirror';
import { Modal, PhotoInput } from './components/ui';
import { GarmentEditor } from './components/GarmentEditor';
import { PersonEditor } from './components/PersonEditor';
type ModalState =
  | { type: 'item'; item: Garment; isNew: boolean }
  | { type: 'person' | 'backup' | 'save' | 'tryon' }
  | null;
export default function App() {
  const [state, setState] = useState<Wardrobe | null>(null),
    [mannequin, setMannequin] = useState<Asset | null>(null),
    [bootError, setBootError] = useState(''),
    [filter, setFilter] = useState<Category | 'all'>('all'),
    [focused, setFocused] = useState<string | null>('demo-shirt'),
    [modal, setModal] = useState<ModalState>(null),
    [confirmation, setConfirmation] = useState<{
      message: string;
      action: () => Promise<void>;
    } | null>(null),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(''),
    [saveName, setSaveName] = useState(''),
    [dialogError, setDialogError] = useState(''),
    [packing, setPacking] = useState(false),
    [lastSaved, setLastSaved] = useState('');
  const current = useRef<Wardrobe | null>(null),
    queue = useRef(Promise.resolve()),
    toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null),
    backupInput = useRef<HTMLInputElement>(null),
    lastRandom = useRef('');
  function notify(message: string) {
    setNotice(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setNotice(''), 4000);
  }
  async function boot() {
    setBootError('');
    try {
      const demo = await loadDemo();
      const saved = await readState();
      const value = saved || demo.state;
      if (!saved) await writeState(value);
      current.current = value;
      setState(value);
      setMannequin(demo.mannequin);
    } catch (e) {
      setBootError((e as Error).message);
    }
  }
  useEffect(() => {
    boot();
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);
  async function commit(
    updater: (s: Wardrobe) => Wardrobe,
    message = '',
  ): Promise<boolean> {
    let succeeded = false;
    const operation = queue.current.then(async () => {
      if (!current.current) return;
      setBusy(true);
      try {
        const next = validateState(updater(structuredClone(current.current)));
        next.revision = current.current.revision + 1;
        await writeState(next);
        current.current = next;
        setState(next);
        setLastSaved(
          new Intl.DateTimeFormat('tr-TR', {
            hour: '2-digit',
            minute: '2-digit',
          }).format(new Date()),
        );
        succeeded = true;
        if (message) notify(message);
      } catch (e) {
        notify((e as Error).message);
      } finally {
        setBusy(false);
      }
    });
    queue.current = operation.catch(() => {});
    await operation;
    return succeeded;
  }
  function close() {
    setModal(null);
    setDialogError('');
  }
  function add() {
    setModal({
      type: 'item',
      item: newGarment({ src: '', width: 1, height: 1 }),
      isNew: true,
    });
  }
  function edit(id: string) {
    const item = current.current?.items.find((i) => i.id === id);
    if (item) setModal({ type: 'item', item, isNew: false });
  }
  async function wear(id: string) {
    await commit((s) => selectItem(s, id));
  }
  async function shuffle() {
    if (!current.current?.items.length) {
      notify('Önce bir parça ekle.');
      return;
    }
    let selected: string[] = [];
    for (let attempt = 0; attempt < 10; attempt++) {
      selected = randomOutfit(current.current);
      if (selected.join('|') !== lastRandom.current) break;
    }
    lastRandom.current = selected.join('|');
    await commit((s) => ({ ...s, selected }), 'Yeni kombin hazır.');
  }
  async function saveItem(item: Garment) {
    const success = await commit((s) => {
      s.items = s.items.some((i) => i.id === item.id)
        ? s.items.map((i) => (i.id === item.id ? item : i))
        : [...s.items, item];
      s.selected = s.selected.filter((id) => s.items.some((i) => i.id === id));
      return s;
    }, 'Parçan kaydedildi.');
    if (success) {
      setFocused(item.id);
      setFilter('all');
      close();
    }
    return success;
  }
  async function savePerson(person: Person) {
    const success = await commit(
      (s) => ({ ...s, person }),
      'Fotoğrafın ve yerleşim noktaların kaydedildi.',
    );
    if (success) close();
    return success;
  }
  async function removeItem(id: string) {
    const success = await commit(
      (s) => ({
        ...s,
        items: s.items.filter((i) => i.id !== id),
        selected: s.selected.filter((x) => x !== id),
        saved: s.saved.map((o) => ({
          ...o,
          items: o.items.filter((x) => x !== id),
        })),
      }),
      'Parça kaldırıldı.',
    );
    if (success) {
      setConfirmation(null);
      close();
    }
  }
  if (!state || !mannequin)
    return (
      <div className="boot-screen">
        <span className="brand">
          gardırobum<span>.</span>
        </span>
        {bootError ? (
          <>
            <p role="alert">{bootError}</p>
            <button className="button primary" onClick={boot}>
              Tekrar Dene
            </button>
          </>
        ) : (
          <>
            <LoaderCircle className="spin" />
            <p>Gardırobun hazırlanıyor…</p>
          </>
        )}
      </div>
    );
  const visible = state.items.filter(
      (i) => filter === 'all' || i.category === filter,
    ),
    selected = selectedSnapshot(state),
    key = resultKey(state),
    result = state.results[key];
  return (
    <>
      <header className="header">
        <a
          href={import.meta.env.BASE_URL}
          className="brand"
          aria-label="Gardırobum"
        >
          <svg viewBox="0 0 40 40" aria-hidden="true">
            <path d="M18 12c0-6 8-6 8-1 0 3-4 4-6 6L6 27c-2 1-1 4 1 4h26c2 0 3-3 1-4L20 17" />
          </svg>
          gardırobum<span>.</span>
        </a>
        <span className="header-caption">FURKAN’IN KİŞİSEL KOLEKSİYONU</span>
        <div className="header-actions">
          <button
            className="icon-button"
            onClick={() => setModal({ type: 'backup' })}
            aria-label="Yedekleme Ve Aktarım"
          >
            <Download size={19} />
          </button>
          <button className="button subtle small" onClick={add}>
            <Plus size={18} />
            Parça Ekle
          </button>
        </div>
      </header>
      <main className="workspace">
        <section className="closet-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                GARDIROP{' '}
                <span>
                  / {String(state.items.length).padStart(2, '0')} PARÇA
                </span>
              </p>
              <h1>Ne giyiyoruz bugün?</h1>
            </div>
            <button
              className="button primary random-button"
              disabled={busy}
              onClick={shuffle}
            >
              <Shuffle size={17} />
              Bugün Ne Giyeyim?
            </button>
          </div>
          <nav className="categories" aria-label="Parça Kategorileri">
            {[['all', 'Tüm Parçalar'], ...Object.entries(categoryLabels)].map(
              ([cat, name]) => (
                <button
                  key={cat}
                  aria-pressed={filter === cat}
                  className={filter === cat ? 'active' : ''}
                  onClick={() => {
                    setFilter(cat as Category | 'all');
                    setFocused(
                      state.items.find(
                        (i) => cat === 'all' || i.category === cat,
                      )?.id || null,
                    );
                  }}
                >
                  {name}
                  <span>
                    {cat === 'all'
                      ? state.items.length
                      : state.items.filter((i) => i.category === cat).length}
                  </span>
                </button>
              ),
            )}
          </nav>
          <Rack
            items={visible}
            selected={state.selected}
            focused={focused}
            onFocus={setFocused}
            onWear={wear}
            onDetails={edit}
            busy={busy}
            onAdd={add}
          />
          <div className="outfit-section">
            <div className="row-heading">
              <h3>
                Seçtiğin Kombin <span>{selected.length}</span>
              </h3>
              <button
                className="text-button"
                disabled={busy || !selected.length}
                onClick={() => commit((s) => ({ ...s, selected: [] }))}
              >
                Temizle
              </button>
            </div>
            <div className="outfit-tray">
              {selected.length ? (
                selected.map((item) => (
                  <article
                    className="outfit-card"
                    key={item.id}
                    data-testid={'selected-' + item.id}
                  >
                    <button
                      className="outfit-main"
                      onClick={() => edit(item.id)}
                    >
                      <img src={assetFor(item).src} alt={item.name} />
                      <span>
                        <strong>{item.name}</strong>
                        <small>
                          {['shirt', 'outerwear'].includes(item.category)
                            ? openingLabels[item.opening]
                            : item.variants.find(
                                (v) => v.id === item.activeVariant,
                              )?.name || fitLabels[item.fit]}
                        </small>
                      </span>
                    </button>
                    <button
                      className="remove-piece"
                      onClick={() => wear(item.id)}
                      aria-label={item.name + ' Kombinden Çıkar'}
                    >
                      <X size={13} />
                    </button>
                  </article>
                ))
              ) : (
                <p className="outfit-empty">
                  Askıdan bir parça seç veya yeni bir kombin oluştur.
                </p>
              )}
            </div>
          </div>
          <div className="saved-section">
            <div className="row-heading">
              <h3>Kombinlerin</h3>
              <button
                className="text-button accent"
                disabled={!selected.length}
                onClick={() => {
                  setSaveName('');
                  setModal({ type: 'save' });
                }}
              >
                <Plus size={15} />
                Kombini Kaydet
              </button>
            </div>
            <div className="saved-outfits">
              {state.saved.length ? (
                state.saved.map((o) => (
                  <div className="saved-outfit" key={o.id}>
                    <button
                      onClick={() =>
                        commit((s) => restoreOutfit(s, o), o.name + ' seçildi.')
                      }
                    >
                      <span className="mini-colors">
                        {o.items.slice(0, 3).map((id) => (
                          <img
                            key={id}
                            src={
                              assetFor(state.items.find((i) => i.id === id)!)
                                .src
                            }
                            alt=""
                          />
                        ))}
                      </span>
                      {o.name}
                    </button>
                    <button
                      aria-label={o.name + ' Kombinini Sil'}
                      className="icon-button"
                      onClick={() =>
                        setConfirmation({
                          message:
                            '“' + o.name + '” kombinini silmek istiyor musun?',
                          action: async () => {
                            await commit(
                              (s) => ({
                                ...s,
                                saved: s.saved.filter((x) => x.id !== o.id),
                              }),
                              'Kombin silindi.',
                            );
                            setConfirmation(null);
                          },
                        })
                      }
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="saved-empty">Sevdiğin kombinleri burada sakla.</p>
              )}
            </div>
          </div>
        </section>
        <Mirror
          person={state.person}
          mannequin={mannequin}
          items={selected}
          result={result}
          onPerson={() => setModal({ type: 'person' })}
          onTryon={() => setModal({ type: 'tryon' })}
          onImportResult={() => setModal({ type: 'tryon' })}
        />
      </main>
      <footer className="footer">
        <span>Kendi parçaların. Kendi tarzın.</span>
        <span
          className={'save-status ' + (busy ? 'saving' : '')}
          aria-live="polite"
        >
          {busy ? (
            <>
              <LoaderCircle size={13} className="spin" />
              Kaydediliyor…
            </>
          ) : (
            <>
              <Check size={13} />
              {lastSaved ? 'Kaydedildi · ' + lastSaved : 'Bu Cihazda Kayıtlı'}
            </>
          )}
        </span>
        <a
          href="https://github.com/dgdfurkan/Gardirobum"
          target="_blank"
          rel="noreferrer"
        >
          GitHub <ArrowUpRight size={12} />
        </a>
      </footer>
      <div
        className={'toast ' + (notice ? 'visible' : '')}
        role="status"
        aria-live="polite"
      >
        {notice}
      </div>
      <Modal
        open={modal?.type === 'item'}
        onClose={close}
        title={
          modal?.type === 'item' && modal.isNew
            ? 'Yeni Parça'
            : 'Parçanı Düzenle'
        }
        description="Fotoğraflar, kalıp ve yerleşim noktaları."
        wide
      >
        {modal?.type === 'item' && (
          <GarmentEditor
            key={modal.item.id}
            initial={modal.item}
            onSave={saveItem}
            onCancel={close}
            onDelete={
              modal.isNew
                ? undefined
                : () =>
                    setConfirmation({
                      message:
                        'Bu parça gardırobundan kaldırılacak. Devam edilsin mi?',
                      action: () => removeItem(modal.item.id),
                    })
            }
          />
        )}
      </Modal>
      <Modal
        open={modal?.type === 'person'}
        onClose={close}
        title="Fotoğrafın Ve Vücut Noktaların"
        description="Omuz, kol, bilek, bel ve ayak yerleşimini fotoğrafında işaretle."
        wide
      >
        {modal?.type === 'person' && (
          <PersonEditor
            initial={state.person}
            mannequin={mannequin}
            onSave={savePerson}
            onCancel={close}
          />
        )}
      </Modal>
      <Modal
        open={modal?.type === 'save'}
        onClose={close}
        title="Kombini Kaydet"
      >
        <div className="modal-body">
          <label className="field">
            Kombin Adı
            <input
              autoFocus
              aria-label="Kombin Adı"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              maxLength={60}
              placeholder="Örn. Rahat Bir Gün"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && saveName.trim())
                  document.getElementById('save-outfit')?.click();
              }}
            />
          </label>
          {dialogError && (
            <p className="form-error" role="alert">
              {dialogError}
            </p>
          )}
        </div>
        <div className="modal-footer">
          <button className="button outline" onClick={close}>
            Vazgeç
          </button>
          <button
            id="save-outfit"
            className="button primary"
            disabled={busy}
            onClick={async () => {
              if (!saveName.trim()) {
                setDialogError('Kombine bir ad ver.');
                return;
              }
              if (
                await commit(
                  (s) => ({
                    ...s,
                    saved: [
                      ...s.saved,
                      {
                        id: uid(),
                        name: saveName.trim(),
                        items: [...s.selected],
                        settings: outfitSettings(s),
                        created: new Date().toISOString(),
                      },
                    ],
                  }),
                  'Kombinin kaydedildi.',
                )
              )
                close();
            }}
          >
            Kombini Kaydet
          </button>
        </div>
      </Modal>
      <Modal
        open={modal?.type === 'backup'}
        onClose={close}
        title="Yedekleme Ve Aktarım"
        description="Fotoğrafların ve kombinlerin bu cihazda saklanır."
      >
        <div className="modal-body backup-body">
          <p>
            Başka cihaza geçmeden veya tarayıcı verilerini silmeden önce
            gardırobunun yedeğini indir.
          </p>
          <button
            className="button dark wide"
            onClick={() =>
              download(
                new Blob([JSON.stringify(state)], { type: 'application/json' }),
                'gardirobum-yedek.json',
              )
            }
          >
            <Download size={17} />
            Gardırobunu İndir
          </button>
          <input
            className="hidden-file"
            type="file"
            accept=".json,application/json"
            ref={backupInput}
            aria-label="Gardırop Yedeği"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (!file) return;
              try {
                if (file.size > 100 * 1024 * 1024)
                  throw Error('Yedek 100 MB’den küçük olmalı.');
                const incoming = validateState(JSON.parse(await file.text()));
                setConfirmation({
                  message:
                    'Bu yedek mevcut gardırobunun yerini alacak. Önce yedeğini aldığından emin ol.',
                  action: async () => {
                    if (
                      await commit(() => incoming, 'Gardırobun içe aktarıldı.')
                    ) {
                      setConfirmation(null);
                      close();
                    }
                  },
                });
              } catch (error) {
                setDialogError((error as Error).message);
              }
            }}
          />
          <button
            className="button outline wide"
            onClick={() => backupInput.current?.click()}
          >
            <FolderOpen size={17} />
            Yedeği İçe Aktar
          </button>
          <p className="help">
            Kod GitHub’da tutulur. Bu ekrandan eklenen kişisel fotoğraflar
            otomatik olarak GitHub’a gönderilmez.
          </p>
          {dialogError && (
            <p className="form-error" role="alert">
              {dialogError}
            </p>
          )}
        </div>
      </Modal>
      <Modal
        open={modal?.type === 'tryon'}
        onClose={close}
        title="Gerçekçi Deneme"
        description="Seçtiğin kombin için fotoğrafları ve promptu birlikte hazırla."
      >
        <div className="modal-body">
          <ol className="tryon-steps">
            <li>
              <span>01</span>
              <div>
                <h3>Deneme Paketini Al</h3>
                <p>
                  Kendi fotoğrafın, seçilen parçalar, ölçüler ve kalibrasyon
                  noktaları tek pakette.
                </p>
                <button
                  className="button dark wide"
                  disabled={packing}
                  onClick={async () => {
                    setPacking(true);
                    setDialogError('');
                    try {
                      download(
                        await tryonPackage(state),
                        'gardirobum-deneme-paketi.zip',
                      );
                      notify('Deneme paketin hazır.');
                    } catch (e) {
                      setDialogError((e as Error).message);
                    } finally {
                      setPacking(false);
                    }
                  }}
                >
                  <Download size={16} />
                  {packing ? 'Hazırlanıyor…' : 'Deneme Paketini İndir'}
                </button>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <h3>Görsel Düzenleme İle Giydir</h3>
                <p>
                  Paketteki fotoğrafları ve promptu görsel düzenleyebilen araca
                  ver.
                </p>
                <button
                  className="button outline wide"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(promptFor(state));
                      notify('Deneme promptu kopyalandı.');
                    } catch {
                      setDialogError(
                        'Kopyalanamadı. İndirdiğin paketteki prompt.txt dosyasını kullan.',
                      );
                    }
                  }}
                >
                  Deneme Promptunu Kopyala
                </button>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <h3>Sonucu Kombinine Ekle</h3>
                <PhotoInput
                  label="Deneme Sonucunu Yükle"
                  onFile={async (file) => {
                    if (!state.person.photo || !selected.length) {
                      setDialogError('Önce fotoğrafını ve bir kombin ekle.');
                      return;
                    }
                    const capturedKey = key;
                    try {
                      const photo = await readPhoto(file);
                      if (
                        await commit(
                          (s) => ({
                            ...s,
                            results: { ...s.results, [capturedKey]: photo },
                          }),
                          'Deneme sonucu kombinine eklendi.',
                        )
                      )
                        close();
                    } catch (e) {
                      setDialogError((e as Error).message);
                    }
                  }}
                />
              </div>
            </li>
          </ol>
          {result && (
            <button
              className="text-button"
              onClick={() =>
                commit((s) => {
                  delete s.results[key];
                  return s;
                }, 'Fotoğraf önizlemesine dönüldü.')
              }
            >
              Eklenen Sonucu Kaldır
            </button>
          )}
          <p className="help">
            Bu sürüm otomatik görüntü üretim API’si çalıştırmaz. Görsel deneme
            gerçek beden uyumunu garanti etmez.
          </p>
          {dialogError && (
            <p className="form-error" role="alert">
              {dialogError}
            </p>
          )}
        </div>
      </Modal>
      <Modal
        open={!!confirmation}
        onClose={() => setConfirmation(null)}
        title="Devam Edilsin Mi?"
      >
        <div className="modal-body">
          <p>{confirmation?.message}</p>
        </div>
        <div className="modal-footer">
          <button
            className="button outline"
            onClick={() => setConfirmation(null)}
          >
            Vazgeç
          </button>
          <button
            className="button primary"
            disabled={busy}
            onClick={() => confirmation?.action()}
          >
            Devam Et
          </button>
        </div>
      </Modal>
    </>
  );
}
