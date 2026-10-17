import { clsx } from 'clsx';
import { ArrowLeft, ArrowRight, Check, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { Button, Card } from '@/components/ui';
import type { Product } from '@/types/domain';
import { CustomerStep, LivePreview } from './CustomerStep';
import { PriceSummary, QuoteChecks } from './PriceSummary';
import { useConfigurator } from './useConfigurator';

export function TestTab({ product }: { product: Product }) {
  const cfg = useConfigurator(product);
  const steps = product.steps.filter((s) => s.enabled);
  const [index, setIndex] = useState(0);
  const step = steps[Math.min(index, steps.length - 1)];

  const chosen = (stepId: string) => {
    const s = product.steps.find((x) => x.id === stepId);
    if (!s) return '';
    if (s.kind === 'dimensions') return `${cfg.config.width} × ${cfg.config.height}`;
    return s.options
      .filter((o) => cfg.optionState(s.id, o.id).selected)
      .map((o) => o.name)
      .join(', ') || '—';
  };

  if (!step) return <Card className="p-8 text-sm text-muted">Activez au moins une étape pour tester.</Card>;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-6">
        <Card className="p-5">
          <ol className="flex gap-1 overflow-x-auto pb-2">
            {steps.map((s, i) => (
              <li key={s.id} className="flex-1">
                <button onClick={() => setIndex(i)} className="flex w-full min-w-[72px] flex-col items-center gap-1.5">
                  <span
                    className={clsx(
                      'grid h-8 w-8 place-items-center rounded-full text-xs font-semibold',
                      i < index ? 'bg-emerald-600 text-white' : i === index ? 'bg-brand-600 text-white ring-4 ring-brand-100' : 'bg-slate-100 text-slate-500',
                    )}
                  >
                    {i < index ? <Check size={14} /> : i + 1}
                  </span>
                  <span className={clsx('text-center text-[11px] leading-tight', i === index ? 'font-semibold text-ink' : 'text-muted')}>{s.title}</span>
                </button>
              </li>
            ))}
          </ol>

          <div className="mt-6 grid gap-6 2xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <div>
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-sm font-semibold text-white">{index + 1}</span>
                <div>
                  <h2 className="text-lg font-semibold">{step.title}</h2>
                  <p className="text-sm text-muted">{step.subtitle}</p>
                </div>
              </div>
              <div className="mt-5">
                <CustomerStep step={step} cfg={cfg} />
              </div>
            </div>
            <LivePreview product={product} cfg={cfg} className="mx-auto h-fit w-full max-w-lg" />
          </div>

          <div className="mt-6 flex justify-between border-t border-line pt-5">
            <Button icon={<ArrowLeft size={16} />} disabled={index === 0} onClick={() => setIndex(index - 1)}>
              Étape précédente
            </Button>
            {index < steps.length - 1 ? (
              <Button variant="primary" onClick={() => setIndex(index + 1)}>
                Étape suivante <ArrowRight size={16} />
              </Button>
            ) : (
              <Button variant="primary" disabled={!cfg.quote.ok}>
                Ajouter au panier
              </Button>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Configuration actuelle</h2>
            <Button size="sm" variant="ghost" icon={<RotateCcw size={14} />} onClick={cfg.reset}>
              Réinitialiser
            </Button>
          </div>
          <dl className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((s, i) => (
              <button key={s.id} onClick={() => setIndex(i)} className="rounded-lg bg-canvas px-3 py-2 text-left hover:bg-brand-50">
                <dt className="text-[11px] text-muted">{s.title}</dt>
                <dd className="truncate text-sm font-medium">{chosen(s.id)}</dd>
              </button>
            ))}
          </dl>
        </Card>
      </div>

      <div className="space-y-4 xl:sticky xl:top-24 xl:h-fit">
        <PriceSummary quote={cfg.quote} />
        <QuoteChecks quote={cfg.quote} />
      </div>
    </div>
  );
}
