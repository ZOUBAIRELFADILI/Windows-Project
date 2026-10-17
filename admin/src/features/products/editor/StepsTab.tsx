import { clsx } from 'clsx';
import { AlertTriangle, ArrowDown, ArrowUp, CheckCircle2, Library, Monitor, Plus, Smartphone } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge, Button, Card, Modal, Toggle } from '@/components/ui';
import { OptionVisual } from '@/components/visuals';
import { formatEuro, priceBadge } from '@/lib/format';
import { computeQuote, defaultConfiguration } from '@/lib/pricing';
import { useAdmin } from '@/store/AdminStore';
import { useUi } from '@/store/UiStore';
import type { LibraryCategory, Option, Product } from '@/types/domain';
import { CustomerStep, LivePreview } from './CustomerStep';
import { OptionCard } from './OptionCard';
import { OptionDrawer } from './OptionDrawer';
import { useConfigurator } from './useConfigurator';

const LIBRARY_FOR_STEP: Record<string, LibraryCategory> = { alu: 'colors', wood: 'woods', glazing: 'glazing', handle: 'handles', extras: 'accessories' };

export function StepsTab({ product }: { product: Product }) {
  const { dispatch, library, promotions } = useAdmin();
  const { toast } = useUi();
  const [activeId, setActiveId] = useState(product.steps.find((s) => s.kind !== 'dimensions')?.id ?? product.steps[0]?.id);
  const [editing, setEditing] = useState<{ option: Option; isNew: boolean } | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [device, setDevice] = useState<'mobile' | 'desktop'>('mobile');

  const active = product.steps.find((s) => s.id === activeId) ?? product.steps[0];
  const cfg = useConfigurator(product);
  const reference = useMemo(() => {
    const c = defaultConfiguration(product);
    return { base: computeQuote(product, c, promotions).base || 4000, width: c.width, height: c.height };
  }, [product, promotions]);

  if (!active) return <p className="text-sm text-muted">Ce produit n’a pas encore d’étape.</p>;

  const category = LIBRARY_FOR_STEP[active.id];
  const available = category ? library.filter((i) => i.category === category && !active.options.some((o) => o.libraryId === i.id)) : [];
  const stepIndex = product.steps.indexOf(active);

  const newOption = (): Option => ({
    id: `opt-${Date.now().toString(36)}`,
    name: '',
    visual: active.id === 'alu' ? { type: 'color', hex: '#9CA3AF' } : active.id === 'wood' ? { type: 'wood', tone: '#D9A066' } : { type: 'icon', name: 'kit' },
    price: { kind: 'included' },
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_340px]">
      {/* Steps list */}
      <Card className="h-fit p-4">
        <h2 className="font-semibold">Étapes du configurateur</h2>
        <p className="mb-4 mt-0.5 text-xs text-muted">Dans l’ordre où le client les voit.</p>
        <ol className="space-y-2">
          {product.steps.map((s, i) => {
            const empty = s.kind !== 'dimensions' && s.options.length === 0;
            return (
              <li key={s.id}>
                <div
                  className={clsx(
                    'flex items-center gap-2 rounded-lg border px-2.5 py-2 transition',
                    s.id === active.id ? 'border-2 border-brand-600 bg-brand-50/50' : 'border-line bg-white hover:border-slate-300',
                    !s.enabled && 'opacity-50',
                  )}
                >
                  <button className="flex min-w-0 flex-1 items-center gap-2 text-left" onClick={() => setActiveId(s.id)}>
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100 text-[11px] font-semibold">{i + 1}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{s.title}</span>
                      <span className="block text-[11px] text-muted">{s.kind === 'dimensions' ? 'Largeur × hauteur' : `${s.options.length} options`}</span>
                    </span>
                  </button>
                  {empty ? <AlertTriangle size={15} className="shrink-0 text-amber-500" /> : <CheckCircle2 size={15} className="shrink-0 text-emerald-500" />}
                </div>
              </li>
            );
          })}
        </ol>
        <Button variant="soft" className="mt-4 w-full" icon={<Plus size={15} />} onClick={() => toast('Types d’étape : choix avec images, Oui/Non, dimensions, couleurs.')}>
          Ajouter une étape
        </Button>
      </Card>

      {/* Active step */}
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-sm font-semibold text-white">{stepIndex + 1}</span>
            <div>
              <h2 className="text-lg font-semibold">{active.title}</h2>
              <p className="text-sm text-muted">{active.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" aria-label="Monter l’étape" disabled={stepIndex === 0} onClick={() => dispatch({ type: 'step/move', productId: product.id, stepId: active.id, dir: -1 })}>
              <ArrowUp size={15} />
            </Button>
            <Button size="sm" variant="ghost" aria-label="Descendre l’étape" disabled={stepIndex === product.steps.length - 1} onClick={() => dispatch({ type: 'step/move', productId: product.id, stepId: active.id, dir: 1 })}>
              <ArrowDown size={15} />
            </Button>
            <span className="ml-2 text-xs font-medium text-slate-600">{active.enabled ? 'Étape active' : 'Masquée'}</span>
            <Toggle label="Activer l’étape" checked={active.enabled} onChange={() => dispatch({ type: 'step/toggle', productId: product.id, stepId: active.id })} />
          </div>
        </div>

        {active.kind === 'dimensions' ? (
          <div className="mt-6 rounded-xl bg-canvas p-5 text-sm text-slate-700">
            <p>Le client saisit la largeur et la hauteur. Les limites viennent des grilles de prix et des règles.</p>
            <p className="mt-2 text-muted">Modifiez-les dans les onglets « Prix » et « Règles ».</p>
          </div>
        ) : (
          <>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-muted">
                {active.options.length} option{active.options.length > 1 ? 's' : ''} · cliquez une carte pour la modifier
              </p>
              <div className="flex gap-2">
                {category && (
                  <Button size="sm" icon={<Library size={14} />} onClick={() => setPickerOpen(true)}>
                    Depuis la bibliothèque
                  </Button>
                )}
                <Button size="sm" variant="primary" icon={<Plus size={14} />} onClick={() => setEditing({ option: newOption(), isNew: true })}>
                  Nouvelle option
                </Button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
              {active.options.map((o) => (
                <OptionCard key={o.id} option={o} selected={o.isDefault} onClick={() => setEditing({ option: o, isNew: false })} />
              ))}
              <button
                onClick={() => setEditing({ option: newOption(), isNew: true })}
                className="grid min-h-[180px] place-items-center rounded-xl border-2 border-dashed border-line text-sm font-semibold text-brand-700 hover:border-brand-200 hover:bg-brand-50/40"
              >
                <span className="flex flex-col items-center gap-2">
                  <Plus size={22} /> Ajouter une option
                </span>
              </button>
            </div>
            <p className="mt-3 text-xs text-muted">La coche bleue indique l’option par défaut.</p>
          </>
        )}
      </Card>

      {/* Customer preview */}
      <Card className="h-fit p-4 xl:sticky xl:top-24">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">
            Aperçu <span className="font-normal text-muted">(vue client)</span>
          </h2>
          <div className="flex rounded-lg bg-slate-100 p-0.5">
            {(['mobile', 'desktop'] as const).map((d) => (
              <button key={d} onClick={() => setDevice(d)} aria-label={d} className={clsx('rounded-md p-1.5', device === d ? 'bg-white text-brand-700 shadow-card' : 'text-slate-500')}>
                {d === 'mobile' ? <Smartphone size={15} /> : <Monitor size={15} />}
              </button>
            ))}
          </div>
        </div>
        <div className={clsx('mx-auto overflow-hidden bg-white', device === 'mobile' ? 'max-w-[300px] rounded-[32px] border-[7px] border-ink' : 'rounded-xl border border-line')}>
          <div className="space-y-3 p-3">
            <div>
              <p className="text-sm font-bold">{product.name}</p>
              <p className="text-xs text-muted">
                Étape {stepIndex + 1} / {product.steps.length} · {active.title}
              </p>
            </div>
            <LivePreview product={product} cfg={cfg} className="!p-2" />
            <CustomerStep step={active} cfg={cfg} compact />
            <div className="flex items-center justify-between border-t border-line pt-3">
              <div>
                <p className="text-[11px] text-muted">Prix estimé</p>
                <p className="font-bold tabular-nums">{formatEuro(cfg.quote.total)}</p>
              </div>
              <Badge tone={cfg.quote.ok ? 'green' : 'amber'}>{cfg.quote.ok ? 'Valide' : 'À vérifier'}</Badge>
            </div>
          </div>
        </div>
      </Card>

      <OptionDrawer
        open={!!editing}
        option={editing?.option ?? null}
        stepTitle={active.title}
        reference={reference}
        libraryItem={library.find((i) => i.id === editing?.option.libraryId)}
        onClose={() => setEditing(null)}
        onDelete={
          editing && !editing.isNew
            ? () => {
                dispatch({ type: 'option/remove', productId: product.id, stepId: active.id, optionId: editing.option.id });
                setEditing(null);
                toast('Option supprimée.');
              }
            : undefined
        }
        onSave={(o) => {
          dispatch({ type: 'option/save', productId: product.id, stepId: active.id, option: o });
          setEditing(null);
          toast('Option enregistrée.');
        }}
      />

      <Modal open={pickerOpen} onClose={() => setPickerOpen(false)} title="Ajouter depuis la bibliothèque" subtitle={`Étape : ${active.title}`} icon={<Library size={20} />}>
        {available.length === 0 ? (
          <p className="text-sm text-muted">Toutes les options de cette catégorie sont déjà dans l’étape.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {available.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  dispatch({
                    type: 'option/save',
                    productId: product.id,
                    stepId: active.id,
                    option: { id: item.id, name: [item.code, item.name].filter(Boolean).join(' '), description: item.description, visual: item.visual, price: item.price, libraryId: item.id },
                  });
                  toast(`« ${item.name} » ajoutée.`);
                }}
                className="rounded-xl border border-line p-2 text-left hover:border-brand-600"
              >
                <OptionVisual visual={item.visual} className="h-20" />
                <p className="mt-2 text-sm font-semibold">{item.code ?? item.name}</p>
                {item.code && <p className="text-xs text-muted">{item.name}</p>}
                <Badge tone="blue" className="mt-2">
                  {priceBadge(item.price)}
                </Badge>
              </button>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
