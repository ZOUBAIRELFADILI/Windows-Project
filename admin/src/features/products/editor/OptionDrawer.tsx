import { clsx } from 'clsx';
import { BadgePercent, Calculator, CircleCheck, Coins, Link2, Ruler, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button, Drawer, Field, Input, Notice, Toggle } from '@/components/ui';
import { OptionVisual } from '@/components/visuals';
import { formatEuro, priceBadge } from '@/lib/format';
import { optionAmount, surfaceM2 } from '@/lib/pricing';
import type { LibraryItem, Option, PriceRule } from '@/types/domain';

const KINDS: Array<{ kind: PriceRule['kind']; title: string; text: string; example: string; icon: typeof Coins }> = [
  { kind: 'included', title: 'Inclus', text: 'Aucun coût supplémentaire.', example: 'Le prix ne change pas', icon: CircleCheck },
  { kind: 'percent', title: 'Pourcentage', text: '+ X % sur le prix de base.', example: '+50 % sur 4 000 € = +2 000 €', icon: BadgePercent },
  { kind: 'fixed', title: 'Montant fixe', text: '+ X € par produit.', example: '+74,48 €', icon: Coins },
  { kind: 'perM2', title: 'Prix au m²', text: 'X € × surface.', example: '43 € × 5,5 m² = 236,50 €', icon: Ruler },
];

export function OptionDrawer({
  open,
  option,
  stepTitle,
  reference,
  libraryItem,
  onClose,
  onSave,
  onDelete,
}: {
  open: boolean;
  option: Option | null;
  stepTitle: string;
  reference: { base: number; width: number; height: number };
  libraryItem?: LibraryItem;
  onClose: () => void;
  onSave: (o: Option) => void;
  onDelete?: () => void;
}) {
  const [draft, setDraft] = useState<Option | null>(option);
  useEffect(() => setDraft(option), [option]);
  if (!draft) return null;

  const set = (patch: Partial<Option>) => setDraft({ ...draft, ...patch });
  const setKind = (kind: PriceRule['kind']) =>
    set({ price: kind === 'included' ? { kind } : { kind, value: draft.price.kind !== 'included' ? draft.price.value : kind === 'percent' ? 10 : 50 } });
  const impact = optionAmount(draft, reference.base, reference.width, reference.height);
  const overridden = libraryItem && JSON.stringify(libraryItem.price) !== JSON.stringify(draft.price);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={`Modifier l’option — ${option?.name ?? ''}`}
      subtitle={`Étape : ${stepTitle}`}
      footer={
        <>
          {onDelete && (
            <Button variant="danger" icon={<Trash2 size={15} />} className="mr-auto" onClick={onDelete}>
              Supprimer
            </Button>
          )}
          <Button onClick={onClose}>Annuler</Button>
          <Button variant="primary" onClick={() => onSave(draft)} disabled={!draft.name.trim()}>
            Enregistrer
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {libraryItem && (
          <Notice
            tone="blue"
            icon={<Link2 size={16} />}
            title="Issue de la bibliothèque d’options"
            action={
              overridden ? (
                <Button size="sm" onClick={() => set({ price: libraryItem.price })}>
                  Rétablir
                </Button>
              ) : undefined
            }
          >
            {overridden
              ? `Prix spécifique à ce produit (bibliothèque : ${priceBadge(libraryItem.price)}).`
              : `Utilisée dans ${libraryItem.usedIn} produits. Vous pouvez donner un prix différent pour ce produit.`}
          </Notice>
        )}

        <div className="flex items-center gap-4">
          <OptionVisual visual={draft.visual} className="h-24 w-32 shrink-0 border border-line" />
          <div className="flex-1 space-y-2">
            {draft.visual.type === 'color' && (
              <Field label="Couleur de l’aperçu">
                <input type="color" value={draft.visual.hex} onChange={(e) => set({ visual: { type: 'color', hex: e.target.value } })} className="h-10 w-full cursor-pointer rounded-lg border border-slate-300" />
              </Field>
            )}
            {draft.visual.type === 'wood' && (
              <Field label="Teinte du bois">
                <input type="color" value={draft.visual.tone} onChange={(e) => set({ visual: { type: 'wood', tone: e.target.value } })} className="h-10 w-full cursor-pointer rounded-lg border border-slate-300" />
              </Field>
            )}
            {draft.visual.type !== 'color' && draft.visual.type !== 'wood' && (
              <div className="rounded-lg border-2 border-dashed border-line p-3 text-center text-xs text-muted">
                <span className="font-semibold text-brand-700">Changer l’image</span> — JPG, PNG ou WEBP, 1200 × 1200 px
              </div>
            )}
          </div>
        </div>

        <Field label="Nom de l’option (affiché aux clients)" hint="Ex. : Chêne, RAL 7016 Gris anthracite…">
          <Input value={draft.name} onChange={(e) => set({ name: e.target.value })} />
        </Field>
        <Field label="Description courte" hint="Apparaît sous l’option dans le configurateur.">
          <textarea value={draft.description ?? ''} onChange={(e) => set({ description: e.target.value })} rows={2} className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-brand-600 focus:outline-none" />
        </Field>

        <div>
          <p className="mb-3 font-semibold">Comment ce choix change le prix ?</p>
          <div className="grid grid-cols-2 gap-2">
            {KINDS.map((k) => (
              <button
                key={k.kind}
                type="button"
                onClick={() => setKind(k.kind)}
                className={clsx('rounded-xl border p-3 text-left transition', draft.price.kind === k.kind ? 'border-2 border-brand-600 bg-brand-50/60' : 'border-line hover:border-slate-300')}
              >
                <k.icon size={18} className={draft.price.kind === k.kind ? 'text-brand-700' : 'text-slate-500'} />
                <p className="mt-1.5 text-sm font-semibold">{k.title}</p>
                <p className="text-xs text-muted">{k.text}</p>
                <p className="mt-2 rounded bg-white/80 px-2 py-1 text-[11px] text-slate-600">Ex. : {k.example}</p>
              </button>
            ))}
          </div>

          {draft.price.kind !== 'included' && (
            <div className="mt-4">
              <Field label={draft.price.kind === 'percent' ? 'Pourcentage d’ajout' : draft.price.kind === 'fixed' ? 'Montant par produit' : 'Prix au m²'}>
                <Input
                  type="number"
                  step={draft.price.kind === 'percent' ? 1 : 0.01}
                  suffix={draft.price.kind === 'percent' ? '%' : draft.price.kind === 'fixed' ? '€' : '€/m²'}
                  value={draft.price.value}
                  onChange={(e) => set({ price: { kind: draft.price.kind as 'percent', value: Number(e.target.value) } })}
                />
              </Field>
            </div>
          )}

          <div className="mt-4 flex gap-3 rounded-xl bg-brand-50 p-4 text-sm text-brand-800">
            <Calculator size={18} className="shrink-0" />
            <p>
              Pour une baie de {reference.width} × {reference.height} mm ({surfaceM2(reference.width, reference.height).toString().replace('.', ',')} m²) à {formatEuro(reference.base)},{' '}
              {impact === 0 ? <strong>ce choix ne change pas le prix.</strong> : <>ce choix ajoute <strong>{formatEuro(impact)}</strong>.</>}
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-xl bg-canvas p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">Option par défaut</p>
              <p className="text-xs text-muted">Déjà sélectionnée quand le client arrive sur l’étape.</p>
            </div>
            <Toggle label="Option par défaut" checked={!!draft.isDefault} onChange={(v) => set({ isDefault: v })} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">Badge PROMO</p>
              <p className="text-xs text-muted">Affiche un badge rouge sur la carte.</p>
            </div>
            <Toggle label="Badge promo" checked={!!draft.promo} onChange={(v) => set({ promo: v })} />
          </div>
        </div>
      </div>
    </Drawer>
  );
}
