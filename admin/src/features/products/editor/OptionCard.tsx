import { clsx } from 'clsx';
import { Check, Link2 } from 'lucide-react';
import { Badge } from '@/components/ui';
import { OptionVisual } from '@/components/visuals';
import { priceBadge } from '@/lib/format';
import type { Option } from '@/types/domain';

export function OptionCard({
  option,
  selected,
  disabled,
  compact,
  note,
  onClick,
}: {
  option: Option;
  selected?: boolean;
  disabled?: boolean;
  compact?: boolean;
  note?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'group relative flex flex-col rounded-xl border bg-white text-left transition',
        compact ? 'p-1.5' : 'p-2.5',
        selected ? 'border-2 border-brand-600 shadow-lift' : 'border-line hover:border-slate-300 hover:shadow-lift',
        disabled && 'cursor-not-allowed opacity-40',
      )}
    >
      {selected && (
        <span className="absolute right-2 top-2 z-10 grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-white ring-2 ring-white">
          <Check size={12} strokeWidth={3} />
        </span>
      )}
      {option.promo && !compact && <span className="absolute left-2 top-2 z-10 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">Promo</span>}
      <OptionVisual visual={option.visual} className={compact ? 'h-14' : 'h-24'} />
      <div className={clsx('flex flex-1 flex-col', compact ? 'px-1 pt-1.5' : 'px-1 pt-2.5')}>
        <p className={clsx('font-semibold leading-tight', compact ? 'text-[11px]' : 'text-sm')}>{option.name}</p>
        {!compact && option.description && <p className="mt-1 line-clamp-2 text-xs text-muted">{option.description}</p>}
        <div className="mt-auto flex items-center justify-between gap-1 pt-2">
          <Badge tone={option.price.kind === 'included' ? 'green' : 'blue'} className={compact ? '!px-1.5 !text-[10px]' : ''}>
            {priceBadge(option.price)}
          </Badge>
          {!compact && option.libraryId && (
            <span title="Issue de la bibliothèque" className="text-slate-400">
              <Link2 size={14} />
            </span>
          )}
        </div>
        {note && <p className="mt-1 text-[11px] font-medium text-amber-700">{note}</p>}
      </div>
    </button>
  );
}
