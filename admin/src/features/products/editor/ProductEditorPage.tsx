import { Copy, Eye, Grid3x3, ListOrdered, Rocket, Split } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge, Button, Card, Progress, Tabs } from '@/components/ui';
import { OptionVisual } from '@/components/visuals';
import { productHealth } from '@/lib/completeness';
import { formatDateTime } from '@/lib/format';
import { useAdmin } from '@/store/AdminStore';
import { useUi } from '@/store/UiStore';
import type { HelpTopic } from '@/features/onboarding/helpContent';
import { NotFoundPage } from '@/features/misc/NotFoundPage';
import { PricingTab } from './PricingTab';
import { RulesTab } from './RulesTab';
import { StepsTab } from './StepsTab';
import { TestTab } from './TestTab';

type TabId = 'etapes' | 'prix' | 'regles' | 'tester';
const HELP_FOR: Record<TabId, HelpTopic> = { etapes: 'editor-steps', prix: 'editor-pricing', regles: 'editor-rules', tester: 'editor-test' };

export function ProductEditorPage() {
  const { productId = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const { getProduct, dispatch } = useAdmin();
  const { toast } = useUi();
  const navigate = useNavigate();

  const product = getProduct(productId);
  if (!product) return <NotFoundPage />;

  const tab = (params.get('onglet') as TabId) ?? 'etapes';
  const health = productHealth(product);

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Produits', to: '/produits' }, { label: product.name }]}
        title={
          <span className="flex items-center gap-3">
            <OptionVisual visual={product.visual} className="hidden h-12 w-16 sm:block" />
            {product.name}
          </span>
        }
        badge={
          <Badge tone={product.status === 'published' ? 'green' : 'slate'} dot>
            {product.status === 'published' ? 'En ligne' : 'Brouillon'}
          </Badge>
        }
        subtitle={`${product.description} · Dernière modification : ${formatDateTime(product.updatedAt)}`}
        help={HELP_FOR[tab]}
        actions={
          <>
            <Button icon={<Eye size={16} />} onClick={() => setParams({ onglet: 'tester' })}>
              Tester comme un client
            </Button>
            <Button icon={<Copy size={16} />} onClick={() => navigate(`/produits?nouveau=1&modele=${product.id}`)}>
              Dupliquer
            </Button>
            <Button
              variant="primary"
              icon={<Rocket size={16} />}
              disabled={product.status === 'published'}
              onClick={() => {
                if (health.issues.length) {
                  toast(`Impossible de publier : ${health.issues.join(', ')}.`);
                  return;
                }
                dispatch({ type: 'product/publish', productId: product.id });
                toast('Produit publié en boutique.');
              }}
            >
              {product.status === 'published' ? 'Publié' : 'Publier'}
            </Button>
          </>
        }
      />

      <Card className="mb-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <div className="mb-1.5 flex justify-between text-sm">
            <span className="font-semibold">Prêt à {health.score} %</span>
            <span className="text-muted">{health.issues.length ? `Il manque : ${health.issues.join(', ')}` : 'Prêt à publier'}</span>
          </div>
          <Progress value={health.score} tone={health.score === 100 ? 'green' : 'amber'} />
        </div>
      </Card>

      <div className="mb-6">
        <Tabs<TabId>
          value={tab}
          onChange={(id) => setParams({ onglet: id })}
          tabs={[
            { id: 'etapes', label: 'Étapes & options', icon: <ListOrdered size={16} />, count: product.steps.length },
            { id: 'prix', label: 'Prix', icon: <Grid3x3 size={16} />, count: product.grids.length },
            { id: 'regles', label: 'Règles', icon: <Split size={16} />, count: product.rules.length },
            { id: 'tester', label: 'Tester', icon: <Eye size={16} /> },
          ]}
        />
      </div>

      {tab === 'etapes' && <StepsTab key={product.id} product={product} />}
      {tab === 'prix' && <PricingTab key={product.id} product={product} />}
      {tab === 'regles' && <RulesTab key={product.id} product={product} />}
      {tab === 'tester' && <TestTab key={product.id} product={product} />}
    </>
  );
}
