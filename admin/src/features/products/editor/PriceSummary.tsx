import { AlertTriangle, CheckCircle2, Info, Tag } from 'lucide-react';
import { Card, Notice } from '@/components/ui';
import { OptionVisual } from '@/components/visuals';
import { formatEuro } from '@/lib/format';
import type { Quote } from '@/lib/pricing';

/** Transparent line-by-line price, shared by the test screen and the order detail. */
export function PriceSummary({ quote, title = 'Détail du prix' }: { quote: Pick<Quote, 'lines' | 'subtotal' | 'discount' | 'total'> & Partial<Pick<Quote, 'promotion'>>; title?: string }) {
  return (
    <Card>
      <div className="px-5 pt-5">
        <h2 className="font-semibold">{title}</h2>
      </div>
      <ul className="divide-y divide-line px-5">
        {quote.lines.map((l) => (
          <li key={l.label + l.detail} className="flex items-center gap-3 py-3">
            {l.visual && <OptionVisual visual={l.visual} className="h-9 w-9 shrink-0" />}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{l.label}</p>
              <p className="truncate text-xs text-muted">{l.detail}</p>
            </div>
            <span className={`text-sm font-semibold tabular-nums ${l.amount === 0 ? 'text-emerald-600' : ''}`}>
              {l.amount === 0 ? 'Inclus' : l.label.startsWith('Prix de base') ? formatEuro(l.amount) : `+ ${formatEuro(l.amount)}`}
            </span>
          </li>
        ))}
      </ul>
      <div className="space-y-2 border-t border-dashed border-line px-5 py-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">Sous-total</span>
          <span className="font-semibold tabular-nums">{formatEuro(quote.subtotal)}</span>
        </div>
        {quote.discount > 0 && (
          <div className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2 text-red-600">
            <span className="flex items-center gap-2">
              <Tag size={14} /> {quote.promotion ? `${quote.promotion.label} −${quote.promotion.percent} %` : 'Promotion'}
            </span>
            <span className="font-semibold tabular-nums">− {formatEuro(quote.discount)}</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between rounded-b-card bg-brand-50 px-5 py-4">
        <span className="font-semibold">Total TTC</span>
        <span className="text-2xl font-bold text-brand-700 tabular-nums">{formatEuro(quote.total)}</span>
      </div>
    </Card>
  );
}

export function QuoteChecks({ quote }: { quote: Quote }) {
  return (
    <div className="space-y-3">
      {quote.errors.map((e) => (
        <Notice key={e} tone="red" icon={<AlertTriangle size={16} />} title="À corriger">
          {e}
        </Notice>
      ))}
      {quote.effects.messages.map((m) => (
        <Notice key={m} tone="amber" icon={<Info size={16} />} title="Message affiché au client">
          {m}
        </Notice>
      ))}
      {quote.ok && (
        <Notice tone="green" icon={<CheckCircle2 size={16} />} title="Aucune erreur de configuration">
          Cette configuration est valide et peut être ajoutée au panier.
        </Notice>
      )}
    </div>
  );
}
