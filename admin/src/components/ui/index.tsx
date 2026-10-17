/**
 * Small design-system primitives (tokens from design/DESIGN.md).
 * Kept in one file on purpose: they are tiny and always used together.
 */
import { clsx } from 'clsx';
import { X } from 'lucide-react';
import { useEffect, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react';

// ---------- Button ----------
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft';
const variants: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-sm',
  secondary: 'bg-white text-slate-800 border border-line hover:bg-canvas hover:border-slate-300',
  ghost: 'text-slate-700 hover:bg-slate-100',
  danger: 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100',
  soft: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'sm' | 'md'; icon?: ReactNode }) {
  return (
    <button
      type="button"
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold whitespace-nowrap transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 disabled:opacity-50 disabled:pointer-events-none',
        size === 'sm' ? 'h-8 px-3 text-xs' : 'h-10 px-4 text-sm',
        variants[variant],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}

// ---------- Badge ----------
export type Tone = 'slate' | 'blue' | 'green' | 'amber' | 'red' | 'violet' | 'sky';
const tones: Record<Tone, string> = {
  slate: 'bg-slate-100 text-slate-600 border-slate-200',
  blue: 'bg-brand-50 text-brand-700 border-brand-200',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  red: 'bg-red-50 text-red-600 border-red-200',
  violet: 'bg-violet-50 text-violet-700 border-violet-200',
  sky: 'bg-sky-50 text-sky-700 border-sky-200',
};

export function Badge({ tone = 'slate', dot, children, className }: { tone?: Tone; dot?: boolean; children: ReactNode; className?: string }) {
  return (
    <span className={clsx('inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap', tones[tone], className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

// ---------- Card ----------
export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={clsx('rounded-card border border-line bg-white shadow-card', className)}>{children}</section>;
}

export function CardHeader({ title, subtitle, action }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 pt-5">
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ---------- Toggle ----------
export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={clsx('relative h-6 w-11 shrink-0 rounded-full transition-colors', checked ? 'bg-brand-600' : 'bg-slate-300')}
    >
      <span className={clsx('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', checked ? 'left-[22px]' : 'left-0.5')} />
    </button>
  );
}

// ---------- Field ----------
export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function Input({ className, suffix, ...rest }: InputHTMLAttributes<HTMLInputElement> & { suffix?: string }) {
  return (
    <div className="relative">
      <input
        className={clsx(
          'h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-ink tabular-nums',
          'focus:border-brand-600 focus:outline-none focus:ring-[3px] focus:ring-brand-600/15',
          suffix && 'pr-12',
          className,
        )}
        {...rest}
      />
      {suffix && <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted">{suffix}</span>}
    </div>
  );
}

// ---------- Progress ----------
export function Progress({ value, tone = 'blue' }: { value: number; tone?: 'blue' | 'green' | 'red' | 'amber' }) {
  const color = { blue: 'bg-brand-600', green: 'bg-emerald-500', red: 'bg-red-500', amber: 'bg-amber-500' }[tone];
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
      <div className={clsx('h-full rounded-full transition-all', color)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

// ---------- Tabs ----------
export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: Array<{ id: T; label: string; icon?: ReactNode; count?: number }>; value: T; onChange: (id: T) => void }) {
  return (
    <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-line">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={clsx(
            '-mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors',
            value === t.id ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-800',
          )}
        >
          {t.icon}
          {t.label}
          {t.count != null && <span className="rounded-full bg-slate-100 px-1.5 text-[11px] text-slate-600">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

// ---------- Overlays ----------
function useEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
}

export function Drawer({ open, onClose, title, subtitle, footer, children, width = 'max-w-[520px]' }: { open: boolean; onClose: () => void; title: ReactNode; subtitle?: ReactNode; footer?: ReactNode; children: ReactNode; width?: string }) {
  useEscape(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-[4px]" onClick={onClose} />
      <aside role="dialog" aria-modal="true" className={clsx('relative flex h-full w-full flex-col bg-white shadow-overlay', width)}>
        <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-ink">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="Fermer" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100">
            <X size={20} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <footer className="flex items-center justify-end gap-3 border-t border-line px-6 py-4">{footer}</footer>}
      </aside>
    </div>
  );
}

export function Modal({ open, onClose, title, subtitle, footer, children, icon }: { open: boolean; onClose: () => void; title: ReactNode; subtitle?: ReactNode; footer?: ReactNode; children: ReactNode; icon?: ReactNode }) {
  useEscape(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-[4px]" onClick={onClose} />
      <div role="dialog" aria-modal="true" className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-card bg-white shadow-overlay">
        <header className="flex items-center justify-between gap-4 border-b border-line bg-brand-50/60 px-6 py-4">
          <div className="flex items-center gap-3">
            {icon && <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-600 text-white">{icon}</div>}
            <div>
              <h2 className="text-lg font-semibold text-ink">{title}</h2>
              {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
            </div>
          </div>
          <button onClick={onClose} aria-label="Fermer" className="rounded-full bg-white p-2 text-slate-500 shadow-card hover:bg-slate-100">
            <X size={18} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
        {footer && <footer className="flex items-center justify-between gap-3 border-t border-line bg-canvas px-6 py-4">{footer}</footer>}
      </div>
    </div>
  );
}

// ---------- Notice ----------
export function Notice({ tone = 'blue', icon, title, children, action }: { tone?: 'blue' | 'amber' | 'red' | 'green'; icon?: ReactNode; title?: ReactNode; children?: ReactNode; action?: ReactNode }) {
  const styles = {
    blue: 'bg-brand-50 border-brand-200 text-brand-800',
    amber: 'bg-amber-50 border-amber-200 text-amber-800',
    red: 'bg-red-50 border-red-200 text-red-700',
    green: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  }[tone];
  return (
    <div className={clsx('flex items-start gap-3 rounded-xl border px-4 py-3 text-sm', styles)}>
      {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={clsx(title && 'mt-0.5', 'opacity-90')}>{children}</div>}
      </div>
      {action}
    </div>
  );
}
