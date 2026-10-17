import { Copy, Pencil, Plus } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge, Button, Card, Progress } from '@/components/ui';
import { OptionVisual } from '@/components/visuals';
import { productHealth } from '@/lib/completeness';
import { formatDate } from '@/lib/format';
import { useAdmin } from '@/store/AdminStore';
import { CreateProductWizard } from './CreateProductWizard';

export function ProductsPage() {
  const { products } = useAdmin();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const wizardOpen = params.get('nouveau') === '1';

  return (
    <>
      <PageHeader
        title="Produits"
        subtitle="Chaque produit est un configurateur que vos clients remplissent étape par étape."
        crumbs={[{ label: 'Catalogue', to: '/' }, { label: 'Produits' }]}
        help="products"
        actions={
          <Button variant="primary" icon={<Plus size={16} />} onClick={() => setParams({ nouveau: '1' })}>
            Créer un produit
          </Button>
        }
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {products.map((p) => {
          const h = productHealth(p);
          const tone = h.score === 100 ? 'green' : h.score >= 60 ? 'amber' : 'red';
          return (
            <Card key={p.id} className="flex flex-col overflow-hidden">
              <button onClick={() => navigate(`/produits/${p.id}`)} className="text-left">
                <OptionVisual visual={p.visual} className="h-40 rounded-none" />
              </button>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted">{p.family}</p>
                    <h2 className="font-semibold">{p.name}</h2>
                  </div>
                  <Badge tone={p.status === 'published' ? 'green' : 'slate'} dot>
                    {p.status === 'published' ? 'En ligne' : 'Brouillon'}
                  </Badge>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-muted">{p.description}</p>

                <div className="mt-4">
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="font-medium text-slate-700">Prêt à {h.score} %</span>
                    <span className="text-muted">{h.issues.length ? `Il manque : ${h.issues.join(', ')}` : 'Tout est prêt'}</span>
                  </div>
                  <Progress value={h.score} tone={tone} />
                </div>

                <p className="mt-3 text-xs text-muted">
                  {p.steps.length} étapes · {p.grids.length} grille{p.grids.length > 1 ? 's' : ''} · modifié le {formatDate(p.updatedAt)}
                </p>

                <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
                  <Button icon={<Pencil size={15} />} onClick={() => navigate(`/produits/${p.id}`)}>
                    Modifier
                  </Button>
                  <Button variant="soft" icon={<Copy size={15} />} onClick={() => setParams({ nouveau: '1', modele: p.id })}>
                    Dupliquer
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <CreateProductWizard open={wizardOpen} templateId={params.get('modele') ?? undefined} onClose={() => setParams({})} />
    </>
  );
}
