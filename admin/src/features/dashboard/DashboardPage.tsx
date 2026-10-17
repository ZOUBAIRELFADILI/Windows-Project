import { clsx } from 'clsx';
import { AlertTriangle, CheckCircle2, Circle, Euro, FileWarning, ImageOff, Plus, Rocket, ShoppingCart, Split, TrendingUp, Wallet } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge, Button, Card, CardHeader, Progress } from '@/components/ui';
import { OptionVisual } from '@/components/visuals';
import { dashboardStats as s } from '@/data/mock';
import { productHealth } from '@/lib/completeness';
import { formatEuro0 } from '@/lib/format';
import { useAdmin } from '@/store/AdminStore';
import { useUi } from '@/store/UiStore';

export const ONBOARDING_PRODUCT_ID = 'baie-accordeon-bois-alu';
const pct = (a: number, b: number) => Math.round(((a - b) / b) * 100);

export function DashboardPage() {
  const { products, library } = useAdmin();
  const { setTourOpen } = useUi();
  const navigate = useNavigate();

  const first = products.find((p) => p.id === ONBOARDING_PRODUCT_ID) ?? products[0];
  const firstHealth = productHealth(first);
  const checklist = [
    { label: 'Infos de base', done: first.description.length > 0 },
    { label: 'Options & finitions', done: firstHealth.emptySteps.length === 0 },
    { label: 'Grille de prix complète', done: firstHealth.missingPrices === 0 },
    { label: 'Règles sans conflit', done: firstHealth.conflicts === 0 },
    { label: 'Publié en boutique', done: first.status === 'published' },
  ];
  const done = checklist.filter((c) => c.done).length;

  const tasks = useMemo(() => {
    const missing = products.filter((p) => productHealth(p).missingPrices > 0);
    const noImage = library.filter((i) => !i.hasImage);
    const conflicts = products.filter((p) => productHealth(p).conflicts > 0);
    return [
      missing.length > 0 && { icon: FileWarning, tone: 'bg-red-50 text-red-600', title: 'Prix manquants', text: `${missing.length} produit${missing.length > 1 ? 's ont' : ' a'} des grilles incomplètes.`, cta: 'Corriger', to: `/produits/${missing[0].id}?onglet=prix` },
      noImage.length > 0 && { icon: ImageOff, tone: 'bg-amber-50 text-amber-600', title: 'Visuel manquant', text: `L’option « ${noImage[0].name} » n’a pas d’image.`, cta: 'Ajouter une image', to: '/bibliotheque' },
      conflicts.length > 0 && { icon: Split, tone: 'bg-violet-50 text-violet-600', title: 'Règles en conflit', text: 'Certaines règles se contredisent.', cta: 'Voir les conflits', to: `/produits/${conflicts[0].id}?onglet=regles` },
      { icon: ShoppingCart, tone: 'bg-emerald-50 text-emerald-600', title: 'Configurations abandonnées', text: `${s.abandoned} devis non finalisés ce mois-ci.`, cta: 'Voir la liste', to: '/commandes' },
    ].filter(Boolean) as Array<{ icon: typeof FileWarning; tone: string; title: string; text: string; cta: string; to: string }>;
  }, [products, library]);

  const max = Math.max(...s.dailyOrders);
  const totalConfigs = products.reduce((n, p) => n + p.configurationsCount, 0);

  return (
    <>
      <PageHeader
        title="Bonjour 👋"
        subtitle="Voici l’activité de vos configurateurs aujourd’hui."
        help="dashboard"
        actions={
          <Button variant="primary" icon={<Plus size={16} />} onClick={() => navigate('/produits?nouveau=1')}>
            Créer un produit
          </Button>
        }
      />

      <Card className="mb-6 p-5" >
        <div data-tour="checklist" className="flex flex-col gap-5 lg:flex-row lg:items-center">
          <div className="flex flex-1 items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-600 text-white">
              <Rocket size={22} />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold">Mon premier produit</h2>
                <Badge tone="green">
                  {done} sur {checklist.length}
                </Badge>
              </div>
              <p className="mt-0.5 text-sm text-muted">
                Préparez « {first.name} » jusqu’à la mise en ligne.
              </p>
              <div className="mt-3 max-w-md">
                <Progress value={(done / checklist.length) * 100} />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="soft" onClick={() => setTourOpen(true)}>
              Lancer la visite (4 étapes)
            </Button>
            <Button onClick={() => navigate(`/produits/${first.id}`)}>Continuer</Button>
          </div>
        </div>
        <ul className="mt-5 grid gap-2 rounded-xl bg-canvas p-3 sm:grid-cols-2 lg:grid-cols-5">
          {checklist.map((c) => (
            <li key={c.label} className={clsx('flex items-center gap-2 text-sm', c.done ? 'text-slate-400 line-through' : 'font-medium text-slate-700')}>
              {c.done ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Circle size={16} className="text-slate-300" />}
              {c.label}
            </li>
          ))}
        </ul>
      </Card>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={ShoppingCart} label="Commandes aujourd’hui" value={String(s.ordersToday)} delta={pct(s.ordersToday, s.ordersYesterday)} note={`Hier : ${s.ordersYesterday} commandes`} />
        <Kpi icon={Euro} label="Chiffre d’affaires du mois" value={formatEuro0(s.revenueMonth)} delta={pct(s.revenueMonth, s.revenueLastMonth)} note={`Mois dernier : ${formatEuro0(s.revenueLastMonth)}`} />
        <Kpi icon={Wallet} label="Panier moyen" value={formatEuro0(s.averageCart)} delta={8} note="Mois dernier : 4 470 €" />
        <Kpi icon={AlertTriangle} label="Configurations abandonnées" value={String(s.abandoned)} delta={29} note="À relancer" bad />
      </div>

      <div className="mb-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader title="Commandes" subtitle="Volume quotidien sur 30 jours" />
          <div className="flex h-56 items-end gap-1 px-5 pb-2 pt-6">
            {s.dailyOrders.map((v, i) => (
              <div key={i} className="group relative flex-1">
                <div className="rounded-t bg-brand-600/80 transition-colors group-hover:bg-brand-700" style={{ height: `${(v / max) * 190}px` }} />
                <span className="pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 rounded bg-ink px-1.5 py-0.5 text-[10px] text-white group-hover:block">{v}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between px-5 pb-5 text-xs text-muted">
            <span>1 oct.</span>
            <span>15 oct.</span>
            <span>Aujourd’hui</span>
          </div>
        </Card>

        <Card>
          <CardHeader title="Produits les plus configurés" subtitle={`${totalConfigs} configurations ce mois`} action={<Link to="/produits" className="text-sm font-medium text-brand-700">Voir tous</Link>} />
          <ul className="space-y-4 p-5">
            {products.map((p) => {
              const share = Math.round((p.configurationsCount / totalConfigs) * 100);
              return (
                <li key={p.id}>
                  <Link to={`/produits/${p.id}`} className="flex items-center gap-3">
                    <OptionVisual visual={p.visual} className="h-11 w-14 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-2">
                        <p className="truncate text-sm font-semibold">{p.name}</p>
                        <span className="text-sm font-semibold text-brand-700 tabular-nums">{share} %</span>
                      </div>
                      <p className="mb-1.5 text-xs text-muted">{p.configurationsCount} configurations</p>
                      <Progress value={share * 2} />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <Card className="p-5">
        <div data-tour="tasks">
          <div className="mb-4 flex items-center gap-2">
            <h2 className="font-semibold">Tâches à traiter</h2>
            <Badge tone="red">{tasks.length}</Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {tasks.map((t) => (
              <div key={t.title} className="flex flex-col rounded-xl bg-canvas p-4">
                <div className="flex items-start gap-3">
                  <div className={clsx('grid h-9 w-9 shrink-0 place-items-center rounded-lg', t.tone)}>
                    <t.icon size={18} />
                  </div>
                  <div>
                    <p className="font-semibold">{t.title}</p>
                    <p className="mt-0.5 text-sm text-muted">{t.text}</p>
                  </div>
                </div>
                <Button className="mt-4 w-full" onClick={() => navigate(t.to)}>
                  {t.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </>
  );
}

function Kpi({ icon: Icon, label, value, delta, note, bad }: { icon: typeof Euro; label: string; value: string; delta: number; note: string; bad?: boolean }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm text-muted">{label}</p>
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-700">
          <Icon size={18} />
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
        <p className="text-[28px] font-bold tabular-nums">{value}</p>
        <span className={clsx('flex items-center gap-0.5 text-xs font-semibold', bad ? 'text-red-600' : 'text-emerald-600')}>
          <TrendingUp size={12} /> +{delta} %
        </span>
      </div>
      <p className="mt-1 text-xs text-muted">{note}</p>
    </Card>
  );
}
