import * as Dialog from '@radix-ui/react-dialog';
import { X, Upload } from 'lucide-react';
import { useRef, type ReactNode } from 'react';
export function Modal({
  title,
  description,
  open,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  description?: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content
          className={'modal ' + (wide ? 'modal-wide' : '')}
          aria-describedby={description ? 'modal-description' : undefined}
        >
          <div className="modal-header">
            <div>
              <Dialog.Title>{title}</Dialog.Title>
              {description && (
                <Dialog.Description id="modal-description">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close className="icon-button" aria-label="Kapat">
              <X size={20} />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function PhotoInput({
  label,
  onFile,
  thumbnail,
  small = false,
}: {
  label: string;
  onFile: (f: File) => Promise<void> | void;
  thumbnail?: string;
  small?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className={'photo-input ' + (small ? 'small' : '')}>
      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        aria-label={label}
        className="hidden-file"
        tabIndex={-1}
        aria-hidden="true"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (f) await onFile(f);
          e.target.value = '';
        }}
      />
      <button
        type="button"
        onClick={() => input.current?.click()}
        className="photo-button"
      >
        {thumbnail ? <img src={thumbnail} alt="" /> : <Upload size={19} />}
        <span>{label}</span>
        {thumbnail && <small>Değiştir</small>}
      </button>
    </div>
  );
}
