import { clsx } from 'clsx';
import { AlertOctagon, ArrowRight, Ban, CircleAlert, EyeOff, MessageSquare, MoveHorizontal, Plus, RotateCcw, WandSparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button, Card, Field, Input, Modal, Notice, Toggle } from '@/components/ui';
import { evaluateRules, findConflicts } from '@/lib/rules';
import { defaultConfiguration } from '@/lib/pricing';
import { useAdmin } from '@/store/AdminStore';
import { useUi } from '@/store/UiStore';
import type { Configuration, Product, Rule, RuleAction } from '@/types/domain';

const ACTIONS: Record<RuleAction['type'], { label: string; icon: typeof Ban; tone: string }> = {
  hide: { label: 'Masquer', icon: EyeOff, tone: 'bg-red-50 text-red-700' },
  disable: { label: 'Désactiver', icon: Ban, tone: 'bg-slate-100 text-slate-700' },
  require: { label: 'Rendre obligatoire', icon: CircleAlert, tone: 'bg-rose-50 text-rose-700' },
  autoAdd: { label: 'Ajouter automatiquement', icon: WandSparkles, tone: 'bg-emerald-50 text-emerald-700' },
  limitWidth: { label: 'Limiter la largeur', icon: MoveHorizontal, tone: 'bg-violet-50 text-violet-700' },
  message: { label: 'Afficher un message', icon: MessageSquare, tone: 'bg-amber-50 text-amber-700' },
};
const FIELDS = { width: 'Largeur', height: 'Hauteur', altitude: 'Altitude du chantier' };

const Chip = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={clsx('inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium', className ?? 'bg-brand-50 text-brand-700')}>{children}</span>
);

function useNames(product: Product) {
  return useMemo(() => {
    const step = (id: string) => product.steps.find((s) => s.id === id);
    return {
      step: (id: string) => step(id)?.title ?? id,
      option: (sid: string, oid: string) => step(sid)?.options.find((o) => o.id === oid)?.name ?? oid,
    };
  }, [product]);
}

function RuleSentence({ rule, product }: { rule: Rule; product: Product }) {
  const n = useNames(product);
  const a = ACTIONS[rule.then.type];
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="font-medium text-slate-500">Quand</span>
      {rule.when.type === 'option' ? (
        <>
          <Chip>{n.step(rule.when.stepId)}</Chip>
          <span className="text-slate-500">est</span>
          <Chip>{n.option(rule.when.stepId, rule.when.optionId)}</Chip>
        </>
      ) : (
        <>
          <Chip>{FIELDS[rule.when.field]}</Chip>
          <span className="text-slate-500">{rule.when.op === 'gt' ? 'est supérieure à' : 'est inférieure à'}</span>
          <Chip className="bg-slate-100 text-slate-800">
            {rule.when.value} {rule.when.field === 'altitude' ? 'm' : 'mm'}
          </Chip>
        </>
      )}
      <ArrowRight size={16} className="text-slate-400" />
      <Chip className={a.tone}>
        <a.icon size={14} /> {a.label}
      </Chip>
      {'stepId' in rule.then && <Chip className="bg-slate-100 text-slate-800">{`${n.step(rule.then.stepId)} : ${n.option(rule.then.stepId, rule.then.optionId)}`}</Chip>}
      {rule.then.type === 'limitWidth' && (
        <Chip className="bg-slate-100 text-slate-800">
          entre {rule.then.min} et {rule.then.max} mm
        </Chip>
      )}
      {rule.then.type === 'message' && <span className="max-w-md rounded-md bg-slate-50 px-2 py-1 text-xs italic text-slate-600">« {rule.then.text} »</span>}
    </div>
  );
}

export function RulesTab({ product }: { product: Product }) {
  const { dispatch } = useAdmin();
  const { toast } = useUi();
  const [config, setConfig] = useState<Configuration>(() => defaultConfiguration(product));
  const [builderOpen, setBuilderOpen] = useState(false);

  const conflicts = findConflicts(product.rules);
  const fx = evaluateRules(product.rules, config);
  const testSteps = product.steps.filter((s) => s.kind !== 'dimensions' && s.options.length > 1).slice(0, 6);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Règles de configuration</h2>
            <p className="text-sm text-muted">Chaque règle se lit comme une phrase. Elles empêchent les combinaisons impossibles.</p>
          </div>
          <Button variant="primary" icon={<Plus size={16} />} onClick={() => setBuilderOpen(true)}>
            Nouvelle règle
          </Button>
        </div>

        {conflicts.length > 0 && (
          <Notice tone="red" icon={<AlertOctagon size={18} />} title={`${conflicts.length} conflit${conflicts.length > 1 ? 's' : ''} détecté${conflicts.length > 1 ? 's' : ''}`}>
            {conflicts.map(([a, b]) => `La règle ${product.rules.indexOf(a) + 1} masque ce que la règle ${product.rules.indexOf(b) + 1} ajoute.`).join(' ')} Corrigez avant de publier.
          </Notice>
        )}

        {product.rules.length === 0 && (
          <Card className="p-8 text-center text-sm text-muted">Aucune règle pour ce produit. Toutes les combinaisons sont autorisées.</Card>
        )}

        {product.rules.map((rule, i) => (
          <Card key={rule.id} className={clsx('p-4', !rule.enabled && 'opacity-60')}>
            <div className="flex items-start gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-semibold">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <RuleSentence rule={rule} product={product} />
                <p className="mt-2 text-xs text-muted">{rule.note}</p>
              </div>
              <Toggle label={`Activer la règle ${i + 1}`} checked={rule.enabled} onChange={() => dispatch({ type: 'rule/toggle', productId: product.id, ruleId: rule.id })} />
            </div>
          </Card>
        ))}
      </div>

      <Card className="h-fit p-5 xl:sticky xl:top-24">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-semibold">Tester les règles</h2>
            <p className="text-sm text-muted">Choisissez des options et voyez ce qui se déclenche.</p>
          </div>
          <Button size="sm" variant="ghost" aria-label="Réinitialiser" onClick={() => setConfig(defaultConfiguration(product))}>
            <RotateCcw size={14} />
          </Button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {testSteps.map((s) => (
            <Field key={s.id} label={s.title}>
              <select
                value={config.selections[s.id]?.[0] ?? ''}
                onChange={(e) => setConfig({ ...config, selections: { ...config.selections, [s.id]: e.target.value ? [e.target.value] : [] } })}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-2 text-sm"
              >
                {s.multi && <option value="">—</option>}
                {s.options.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </Field>
          ))}
          <Field label="Largeur">
            <Input type="number" step={10} suffix="mm" value={config.width} onChange={(e) => setConfig({ ...config, width: Number(e.target.value) })} />
          </Field>
          <Field label="Altitude">
            <Input type="number" step={50} suffix="m" value={config.altitude} onChange={(e) => setConfig({ ...config, altitude: Number(e.target.value) })} />
          </Field>
        </div>

        <p className="mb-2 mt-5 text-sm font-semibold">Règles déclenchées ({fx.fired.length})</p>
        {fx.fired.length === 0 ? (
          <p className="text-sm text-muted">Aucune règle ne s’applique à cette configuration.</p>
        ) : (
          <ul className="space-y-2">
            {fx.fired.map((r) => {
              const a = ACTIONS[r.then.type];
              return (
                <li key={r.id} className={clsx('flex items-start gap-2 rounded-lg px-3 py-2 text-sm', a.tone)}>
                  <a.icon size={15} className="mt-0.5 shrink-0" />
                  <span>
                    <strong>Règle {product.rules.indexOf(r) + 1}</strong> — {r.note}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <RuleBuilder
        open={builderOpen}
        product={product}
        onClose={() => setBuilderOpen(false)}
        onCreate={(rule) => {
          dispatch({ type: 'rule/add', productId: product.id, rule });
          setBuilderOpen(false);
          toast('Règle ajoutée.');
        }}
      />
    </div>
  );
}

function RuleBuilder({ open, product, onClose, onCreate }: { open: boolean; product: Product; onClose: () => void; onCreate: (r: Rule) => void }) {
  const steps = product.steps.filter((s) => s.kind !== 'dimensions' && s.options.length > 0);
  const [whenStep, setWhenStep] = useState(steps[0]?.id ?? '');
  const [whenOption, setWhenOption] = useState('');
  const [action, setAction] = useState<'hide' | 'disable' | 'require' | 'autoAdd' | 'message'>('hide');
  const [thenStep, setThenStep] = useState(steps[1]?.id ?? '');
  const [thenOption, setThenOption] = useState('');
  const [text, setText] = useState('');

  const ws = steps.find((s) => s.id === whenStep);
  const ts = steps.find((s) => s.id === thenStep);
  const wo = whenOption || ws?.options[0]?.id || '';
  const to = thenOption || ts?.options[0]?.id || '';
  const select = 'h-10 rounded-lg border border-brand-200 bg-brand-50 px-2 text-sm font-medium text-brand-800';

  const build = (): Rule => ({
    id: `r-${Date.now().toString(36)}`,
    enabled: true,
    when: { type: 'option', stepId: whenStep, optionId: wo },
    then: action === 'message' ? { type: 'message', text } : { type: action, stepId: thenStep, optionId: to },
    note: action === 'message' ? 'Message affiché au client.' : `${ACTIONS[action].label} « ${ts?.options.find((o) => o.id === to)?.name} » quand « ${ws?.options.find((o) => o.id === wo)?.name} » est choisi.`,
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nouvelle règle"
      subtitle="Composez la phrase, de gauche à droite."
      icon={<Plus size={20} />}
      footer={
        <>
          <Button onClick={onClose}>Annuler</Button>
          <Button variant="primary" disabled={action === 'message' && !text.trim()} onClick={() => onCreate(build())}>
            Ajouter la règle
          </Button>
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-canvas p-4 text-sm">
        <span className="font-medium text-slate-500">Quand</span>
        <select className={select} value={whenStep} onChange={(e) => (setWhenStep(e.target.value), setWhenOption(''))}>
          {steps.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
        <span className="text-slate-500">est</span>
        <select className={select} value={wo} onChange={(e) => setWhenOption(e.target.value)}>
          {ws?.options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
        <ArrowRight size={16} className="text-slate-400" />
        <select className={select} value={action} onChange={(e) => setAction(e.target.value as typeof action)}>
          {(['hide', 'disable', 'require', 'autoAdd', 'message'] as const).map((a) => (
            <option key={a} value={a}>
              {ACTIONS[a].label}
            </option>
          ))}
        </select>
        {action !== 'message' && (
          <>
            <select className={select} value={thenStep} onChange={(e) => (setThenStep(e.target.value), setThenOption(''))}>
              {steps.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
            <select className={select} value={to} onChange={(e) => setThenOption(e.target.value)}>
              {ts?.options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </>
        )}
      </div>
      {action === 'message' && (
        <div className="mt-4">
          <Field label="Message affiché au client">
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ex. : Nous recommandons un vitrage trempé." />
          </Field>
        </div>
      )}
      <p className="mt-4 text-xs text-muted">Astuce : testez la règle juste après dans le panneau « Tester les règles ».</p>
    </Modal>
  );
}
