import { clsx } from 'clsx';
import { ArrowLeft, ArrowRight, Check, FilePlus2, FileSpreadsheet, Info, SlidersHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Field, Input, Modal, Notice, Toggle } from '@/components/ui';
import { OptionVisual } from '@/components/visuals';
import type { Product } from '@/types/domain';
import { useAdmin } from '@/store/AdminStore';
import { useUi } from '@/store/UiStore';

const STEPS = ['Infos', 'Modèle', 'Étapes', 'Prix', 'Vérifier'];
const BLANK = '__blank__';

const slug = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'produit';

export function CreateProductWizard({ open, onClose, templateId }: { open: boolean; onClose: () => void; templateId?: string }) {
  const { products, dispatch } = useAdmin();
  const { toast } = useUi();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [family, setFamily] = useState('Baies vitrées');
  const [description, setDescription] = useState('');
  const [template, setTemplate] = useState<string>(products[0]?.id ?? BLANK);
  const [keptSteps, setKeptSteps] = useState<Set<string>>(new Set());
  const [pricing, setPricing] = useState<'copy' | 'later'>('copy');

  const source = products.find((p) => p.id === template);

  useEffect(() => {
    if (!open) return;
    setStep(templateId ? 1 : 0);
    setTemplate(templateId ?? products[0]?.id ?? BLANK);
    const t = products.find((p) => p.id === (templateId ?? products[0]?.id));
    setName(t ? `${t.name} (copie)` : '');
    setDescription(t?.description ?? '');
    setFamily(t?.family ?? 'Baies vitrées');
  }, [open, templateId, products]);

  useEffect(() => {
    setKeptSteps(new Set(source?.steps.map((s) => s.id) ?? []));
  }, [template]); // eslint-disable-line react-hooks/exhaustive-deps

  const create = () => {
    const base: Product = source
      ? structuredClone(source)
      : {
          id: '',
          name: '',
          family,
          description: '',
          status: 'draft',
          visual: { type: 'window', panels: 2 },
          steps: [{ id: 'dimensions', title: 'Dimensions', subtitle: 'Largeur × hauteur hors tout, en mm.', kind: 'dimensions', enabled: true, options: [] }],
          grids: [],
          rules: [],
          configurationsCount: 0,
          updatedAt: '',
        };
    const product: Product = {
      ...base,
      id: `${slug(name)}-${Date.now().toString(36)}`,
      name: name.trim() || 'Nouveau produit',
      family,
      description,
      status: 'draft',
      steps: source ? base.steps.filter((s) => keptSteps.has(s.id)) : base.steps,
      grids: pricing === 'copy' ? base.grids : [],
      rules: base.rules.filter((r) => !('stepId' in r.then) || keptSteps.has(r.then.stepId)),
      configurationsCount: 0,
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'product/create', product });
    toast('Brouillon créé. Rien n’est visible en boutique avant publication.');
    onClose();
    navigate(`/produits/${product.id}`);
  };

  const canNext = step !== 0 || name.trim().length > 1;

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={<SlidersHorizontal size={20} />}
      title="Créer un produit"
      subtitle="Assistant pas-à-pas"
      footer={
        <>
          <Button icon={<ArrowLeft size={16} />} onClick={() => (step === 0 ? onClose() : setStep(step - 1))}>
            {step === 0 ? 'Annuler' : 'Précédent'}
          </Button>
          {step < STEPS.length - 1 ? (
            <Button variant="primary" disabled={!canNext} onClick={() => setStep(step + 1)}>
              Étape suivante <ArrowRight size={16} />
            </Button>
          ) : (
            <Button variant="primary" icon={<Check size={16} />} onClick={create}>
              Créer le brouillon
            </Button>
          )}
        </>
      }
    >
      <ol className="mb-8 flex items-center">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={clsx(
                  'grid h-9 w-9 place-items-center rounded-full text-sm font-semibold',
                  i < step ? 'bg-emerald-600 text-white' : i === step ? 'bg-brand-600 text-white ring-4 ring-brand-100' : 'bg-slate-100 text-slate-500',
                )}
              >
                {i < step ? <Check size={16} /> : i + 1}
              </span>
              <span className={clsx('text-xs', i === step ? 'font-semibold text-brand-700' : 'text-muted')}>{label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={clsx('mx-2 mb-5 h-0.5 flex-1 rounded', i < step ? 'bg-emerald-500' : 'bg-slate-200')} />}
          </li>
        ))}
      </ol>

      <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
        Étape {step + 1} sur {STEPS.length}
      </p>

      {step === 0 && (
        <div className="mt-2 space-y-5">
          <h3 className="text-2xl font-bold">Comment s’appelle ce produit ?</h3>
          <Field label="Nom du produit" hint="Ex. : Baie accordéon Bois-Alu">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom affiché aux clients" autoFocus />
          </Field>
          <Field label="Famille">
            <select value={family} onChange={(e) => setFamily(e.target.value)} className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm">
              {['Baies vitrées', 'Fenêtres', 'Portes-fenêtres', 'Portes d’entrée'].map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </Field>
          <Field label="Description courte" hint="Elle apparaît en haut du configurateur client.">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-brand-600 focus:outline-none" />
          </Field>
        </div>
      )}

      {step === 1 && (
        <div className="mt-2">
          <h3 className="text-2xl font-bold">Choisissez un modèle de départ</h3>
          <p className="mt-1 text-sm text-muted">Dupliquer un produit existant est le plus rapide : étapes, options, prix et règles sont copiés.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[...products.slice(0, 2), null].map((p) => {
              const id = p?.id ?? BLANK;
              const selected = template === id;
              return (
                <button
                  key={id}
                  onClick={() => setTemplate(id)}
                  className={clsx('relative rounded-xl border p-4 text-left', selected ? 'border-2 border-brand-600 bg-brand-50/50' : 'border-line hover:border-slate-300')}
                >
                  {selected && (
                    <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-brand-600 text-white">
                      <Check size={14} />
                    </span>
                  )}
                  {p ? <OptionVisual visual={p.visual} className="mb-3 h-24" /> : <div className="mb-3 grid h-24 place-items-center rounded-lg bg-slate-50 text-slate-400"><FilePlus2 size={30} /></div>}
                  <p className="font-semibold">{p?.name ?? 'Modèle vierge'}</p>
                  <p className="text-xs text-muted">{p ? `Dupliquer ${p.steps.length} étapes · ${p.rules.length} règles` : 'Partir de zéro'}</p>
                </button>
              );
            })}
          </div>
          {source && (
            <div className="mt-5">
              <Notice tone="blue" icon={<Info size={16} />}>
                La copie garde les prix et les règles. Vous pourrez tout modifier ensuite.
              </Notice>
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="mt-2">
          <h3 className="text-2xl font-bold">Quelles étapes garder ?</h3>
          <p className="mt-1 text-sm text-muted">Désactivez celles qui ne concernent pas ce produit. Vous pourrez en ajouter plus tard.</p>
          {source ? (
            <ul className="mt-5 grid gap-2 md:grid-cols-2">
              {source.steps.map((s, i) => (
                <li key={s.id} className="flex items-center gap-3 rounded-lg border border-line px-4 py-3">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-100 text-xs font-semibold">{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{s.title}</p>
                    <p className="text-xs text-muted">{s.kind === 'dimensions' ? 'Largeur × hauteur' : `${s.options.length} options`}</p>
                  </div>
                  <Toggle
                    label={s.title}
                    checked={keptSteps.has(s.id)}
                    onChange={(v) => {
                      const next = new Set(keptSteps);
                      if (v) next.add(s.id);
                      else next.delete(s.id);
                      setKeptSteps(next);
                    }}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <Notice tone="amber">Modèle vierge : seule l’étape « Dimensions » sera créée. Vous ajouterez les autres dans l’éditeur.</Notice>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="mt-2">
          <h3 className="text-2xl font-bold">Et les prix ?</h3>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              { id: 'copy' as const, icon: <Check size={22} />, title: 'Copier les grilles du modèle', text: source ? `${source.grids.length} grille(s) de prix copiée(s), modifiables ensuite.` : 'Aucun modèle choisi.' },
              { id: 'later' as const, icon: <FileSpreadsheet size={22} />, title: 'Importer plus tard depuis Excel', text: 'Les grilles seront vides. Le produit restera en brouillon tant qu’elles ne sont pas remplies.' },
            ].map((o) => (
              <button
                key={o.id}
                disabled={o.id === 'copy' && !source}
                onClick={() => setPricing(o.id)}
                className={clsx('rounded-xl border p-5 text-left disabled:opacity-50', pricing === o.id ? 'border-2 border-brand-600 bg-brand-50/50' : 'border-line')}
              >
                <span className="text-brand-700">{o.icon}</span>
                <p className="mt-2 font-semibold">{o.title}</p>
                <p className="mt-1 text-sm text-muted">{o.text}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="mt-2">
          <h3 className="text-2xl font-bold">Tout est prêt</h3>
          <dl className="mt-5 divide-y divide-line rounded-xl border border-line text-sm">
            {[
              ['Nom', name || '—'],
              ['Famille', family],
              ['Modèle', source?.name ?? 'Vierge'],
              ['Étapes', source ? `${keptSteps.size} sur ${source.steps.length}` : '1 (Dimensions)'],
              ['Prix', pricing === 'copy' && source ? `${source.grids.length} grille(s) copiée(s)` : 'À importer'],
              ['Statut', 'Brouillon (non visible en boutique)'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-muted">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-sm text-muted">Après création, ouvrez l’onglet « Tester » pour vérifier le parcours client avant de publier.</p>
        </div>
      )}
    </Modal>
  );
}
