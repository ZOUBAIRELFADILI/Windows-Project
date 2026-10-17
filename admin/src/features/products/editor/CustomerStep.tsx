import { clsx } from 'clsx';
import { Field, Input } from '@/components/ui';
import { WindowDrawing } from '@/components/visuals';
import type { Product, Step } from '@/types/domain';
import { OptionCard } from './OptionCard';
import type { useConfigurator } from './useConfigurator';

type Configurator = ReturnType<typeof useConfigurator>;

/** One step of the customer configurator, exactly as the shop will show it. */
export function CustomerStep({ step, cfg, compact }: { step: Step; cfg: Configurator; compact?: boolean }) {
  if (step.kind === 'dimensions') {
    const grid = cfg.quote.grid;
    const limit = cfg.quote.effects.widthLimit;
    return (
      <div className={clsx('grid gap-3', compact ? 'grid-cols-2' : 'sm:grid-cols-2')}>
        <Field label="Largeur" hint={limit ? `${limit.min} – ${limit.max} mm` : grid ? `${grid.minWidth} – ${grid.maxWidth} mm` : undefined}>
          <Input type="number" step={10} suffix="mm" value={cfg.config.width} onChange={(e) => cfg.setConfig({ ...cfg.config, width: Number(e.target.value) })} />
        </Field>
        <Field label="Hauteur" hint={grid ? `${grid.minHeight} – ${grid.maxHeight} mm` : undefined}>
          <Input type="number" step={10} suffix="mm" value={cfg.config.height} onChange={(e) => cfg.setConfig({ ...cfg.config, height: Number(e.target.value) })} />
        </Field>
        {!compact && (
          <Field label="Altitude du chantier" hint="Utilisée par certaines règles (ex. valve > 800 m).">
            <Input type="number" step={50} suffix="m" value={cfg.config.altitude} onChange={(e) => cfg.setConfig({ ...cfg.config, altitude: Number(e.target.value) })} />
          </Field>
        )}
      </div>
    );
  }

  const visible = step.options.filter((o) => !cfg.optionState(step.id, o.id).hidden);
  return (
    <div className={clsx('grid gap-2', compact ? 'grid-cols-3' : 'grid-cols-[repeat(auto-fill,minmax(150px,1fr))]')}>
      {visible.map((o) => {
        const st = cfg.optionState(step.id, o.id);
        return (
          <OptionCard
            key={o.id}
            option={o}
            compact={compact}
            selected={st.selected}
            disabled={st.disabled}
            note={st.auto ? 'Ajouté automatiquement' : st.required ? 'Obligatoire' : undefined}
            onClick={() => cfg.select(step, o.id)}
          />
        );
      })}
    </div>
  );
}

/** Live drawing that follows the customer's choices. */
export function LivePreview({ product, cfg, className }: { product: Product; cfg: Configurator; className?: string }) {
  const pick = (stepId: string) => {
    const step = product.steps.find((s) => s.id === stepId);
    return step?.options.find((o) => cfg.config.selections[stepId]?.includes(o.id));
  };
  const alu = pick('alu')?.visual;
  const wood = pick('wood')?.visual;
  const panels = pick('panels')?.panels ?? (product.visual.type === 'window' ? product.visual.panels : 3);
  const opening = product.visual.type === 'window' ? product.visual.opening : 'fold';
  return (
    <div className={clsx('rounded-xl bg-gradient-to-b from-sky-100 via-sky-50 to-stone-100 p-4', className)}>
      <WindowDrawing
        panels={panels}
        opening={opening}
        frame={alu?.type === 'color' ? alu.hex : '#383E42'}
        wood={wood?.type === 'wood' ? wood.tone : undefined}
        width={cfg.config.width}
        height={cfg.config.height}
      />
    </div>
  );
}
