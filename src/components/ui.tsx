import * as Dialog from '@radix-ui/react-dialog';
import * as Select from '@radix-ui/react-select';
import * as Slider from '@radix-ui/react-slider';
import { Check, ChevronDown, X, Upload } from 'lucide-react';
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
export function Choice({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <Select.Root value={value} onValueChange={onChange}>
        <Select.Trigger className="choice-trigger" aria-label={label}>
          <Select.Value />
          <Select.Icon>
            <ChevronDown size={16} />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            position="popper"
            sideOffset={6}
            className="choice-menu"
          >
            <Select.Viewport>
              {options.map((o) => (
                <Select.Item
                  key={o.value}
                  value={o.value}
                  className="choice-option"
                >
                  <Select.ItemText>{o.label}</Select.ItemText>
                  <Select.ItemIndicator>
                    <Check size={16} />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}
export function Range({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  suffix = '',
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  suffix?: string;
}) {
  return (
    <div className="range-field">
      <div>
        <span>{label}</span>
        <output>
          {Math.round(value * 100) / 100}
          {suffix}
        </output>
      </div>
      <Slider.Root
        className="range-root"
        value={[value]}
        onValueChange={(v) => onChange(v[0])}
        min={min}
        max={max}
        step={step}
        aria-label={label}
      >
        <Slider.Track className="range-track">
          <Slider.Range className="range-fill" />
        </Slider.Track>
        <Slider.Thumb className="range-thumb" />
      </Slider.Root>
    </div>
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
export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      className={'toggle ' + (checked ? 'on' : '')}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
    >
      <span className="toggle-track">
        <i />
      </span>
      {label}
    </button>
  );
}
