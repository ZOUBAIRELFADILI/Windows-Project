import { clsx } from 'clsx';
import { Archive, Check, ImageOff, Percent, Plus, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge, Button, Card, Drawer, Field, Input, Notice, Tabs } from '@/components/ui';
import { OptionVisual } from '@/components/visuals';
import { priceBadge } from '@/lib/format';
import { useAdmin } from '@/store/AdminStore';
import { useUi } from '@/store/UiStore';
import type { LibraryCategory, LibraryItem, PriceRule } from '@/types/domain';

const TABS: Array<{ id: LibraryCategory; label: string }> = [
  { id: 'colors', label: 'Couleurs RAL' },
  { id: 'woods', label: 'Bois' },
  { id: 'glazing', label: 'Vitrages' },
  { id: 'handles', label: 'Poignées' },
  { id: 'hardware', label: 'Ferrures' },
  { id: 'accessories', label: 'Accessoires' },
];

export function LibraryPage() {
  const { library, dispatch } = useAdmin();
  const { toast } = useUi();
  const [tab, setTab] = useState<LibraryCategory>('colors');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<LibraryItem | null>(null);
  const [bulk, setBulk] = useState(5);

  const items = useMemo(
    () => library.filter((i) => i.category === tab && `${i.code ?? ''} ${i.name}`.toLowerCase().includes(query.toLowerCase())),
    [library, tab, query],
  );

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  return (
    <>
      <PageHeader
        title="Bibliothèque d’options"
        subtitle="Créez une option une seule fois et utilisez-la dans tous vos produits."
        help="library"
        actions={
          <Button variant="primary" icon={<Plus size={16} />} onClick={() => toast('La création d’option sera branchée à l’API.')}>
            Nouvelle option
          </Button>
        }
      />

      <div className="mb-5">
        <Tabs
          value={tab}
          onChange={(t) => {
            setTab(t);
            setSelected(new Set());
          }}
          tabs={TABS.map((t) => ({ ...t, count: library.filter((i) => i.category === t.id).length }))}
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un nom, un code RAL…" className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-sm focus:border-brand-600 focus:outline-none" />
        </div>
      </div>

      {selected.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3">
          <span className="text-sm font-semibold text-brand-800">
            {selected.size} option{selected.size > 1 ? 's' : ''} sélectionnée{selected.size > 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-2 rounded-lg bg-white px-2">
            <Percent size={14} className="text-slate-500" />
            <select value={bulk} onChange={(e) => setBulk(Number(e.target.value))} className="h-8 bg-transparent text-sm">
              {[-10, -5, 5, 10, 15].map((v) => (
                <option key={v} value={v}>
                  {v > 0 ? `+${v}` : v} %
                </option>
              ))}
            </select>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                dispatch({ type: 'library/bulkPrice', ids: [...selected], percent: bulk });
                toast(`Prix modifiés pour ${selected.size} options.`);
              }}
            >
              Modifier les prix
            </Button>
          </div>
          <Button size="sm" variant="danger" icon={<Archive size={14} />} onClick={() => toast('Archivage : disponible avec l’API.')}>
            Archiver
          </Button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-slate-500 hover:text-ink" aria-label="Désélectionner">
            <X size={18} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {items.map((item) => {
          const isSel = selected.has(item.id);
          return (
            <Card key={item.id} className={clsx('relative p-3 transition', isSel && 'ring-2 ring-brand-600')}>
              <button
                onClick={() => toggle(item.id)}
                aria-label="Sélectionner"
                className={clsx('absolute left-5 top-5 z-10 grid h-5 w-5 place-items-center rounded border-2', isSel ? 'border-brand-600 bg-brand-600 text-white' : 'border-white bg-white/80')}
              >
                {isSel && <Check size={12} strokeWidth={3} />}
              </button>
              <button onClick={() => setEditing(item)} className="block w-full text-left">
                {item.hasImage ? (
                  <OptionVisual visual={item.visual} className="h-24" />
                ) : (
                  <div className="grid h-24 place-items-center rounded-lg border-2 border-dashed border-amber-300 bg-amber-50 text-amber-600">
                    <ImageOff size={24} />
                  </div>
                )}
                <p className="mt-3 text-sm font-semibold">{item.code ?? item.name}</p>
                {item.code && <p className="text-xs text-muted">{item.name}</p>}
                <Badge tone={item.price.kind === 'included' ? 'green' : 'blue'} className="mt-2">
                  {priceBadge(item.price)}
                </Badge>
                <p className="mt-2 text-xs text-muted">Utilisé dans {item.usedIn} produits</p>
              </button>
            </Card>
          );
        })}
        <button onClick={() => toast('La création d’option sera branchée à l’API.')} className="grid min-h-[200px] place-items-center rounded-card border-2 border-dashed border-line text-sm font-semibold text-brand-700 hover:bg-brand-50/40">
          <span className="flex flex-col items-center gap-2">
            <Plus size={22} /> Ajouter
          </span>
        </button>
      </div>

      <LibraryDrawer
        item={editing}
        onClose={() => setEditing(null)}
        onSave={(item) => {
          dispatch({ type: 'library/save', item });
          setEditing(null);
          toast(`Enregistré — appliqué aux ${item.usedIn} produits qui utilisent cette option.`);
        }}
      />
    </>
  );
}

function LibraryDrawer({ item, onClose, onSave }: { item: LibraryItem | null; onClose: () => void; onSave: (i: LibraryItem) => void }) {
  const [draft, setDraft] = useState<LibraryItem | null>(null);
  if (item && draft?.id !== item.id) setDraft(item);
  if (!item || !draft) return null;

  const setPrice = (price: PriceRule) => setDraft({ ...draft, price });
  return (
    <Drawer
      open
      onClose={onClose}
      title={`Modifier — ${item.code ?? item.name}`}
      subtitle="Option partagée entre plusieurs produits"
      footer={
        <>
          <Button onClick={onClose}>Annuler</Button>
          <Button variant="primary" onClick={() => onSave({ ...draft, hasImage: true })}>
            Enregistrer
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <OptionVisual visual={draft.visual} className="h-32 border border-line" />
        {draft.visual.type === 'color' && (
          <Field label="Couleur de l’aperçu">
            <input type="color" value={draft.visual.hex} onChange={(e) => setDraft({ ...draft, visual: { type: 'color', hex: e.target.value } })} className="h-10 w-full rounded-lg border border-slate-300" />
          </Field>
        )}
        {draft.code !== undefined && (
          <Field label="Code" hint="Ex. : RAL 7016">
            <Input value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} />
          </Field>
        )}
        <Field label="Nom">
          <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        </Field>
        <Field label="Prix par défaut" hint="Chaque produit peut le remplacer par son propre prix.">
          <div className="grid grid-cols-[1fr_120px] gap-2">
            <select
              value={draft.price.kind}
              onChange={(e) => {
                const kind = e.target.value as PriceRule['kind'];
                setPrice(kind === 'included' ? { kind } : { kind, value: draft.price.kind !== 'included' ? draft.price.value : 10 });
              }}
              className="h-10 rounded-lg border border-slate-300 bg-white px-2 text-sm"
            >
              <option value="included">Inclus</option>
              <option value="percent">Pourcentage</option>
              <option value="fixed">Montant fixe</option>
              <option value="perM2">Prix au m²</option>
            </select>
            {draft.price.kind !== 'included' && (
              <Input type="number" value={draft.price.value} onChange={(e) => setPrice({ kind: draft.price.kind as 'fixed', value: Number(e.target.value) })} />
            )}
          </div>
        </Field>
        <Notice tone="blue" title={`Utilisée dans ${draft.usedIn} produits`}>
          Ce changement s’applique à tous ces produits, sauf ceux qui ont un prix spécifique.
        </Notice>
      </div>
    </Drawer>
  );
}
