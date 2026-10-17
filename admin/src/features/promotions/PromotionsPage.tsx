import { Tag } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge, Card } from '@/components/ui';
import { useAdmin } from '@/store/AdminStore';

export function PromotionsPage() {
  const { promotions, products } = useAdmin();
  return (
    <>
      <PageHeader title="Promotions" subtitle="Une remise en % appliquée au total du produit." help="promotions" />
      <div className="grid gap-4 md:grid-cols-2">
        {promotions.map((p) => {
          const linked = products.filter((x) => x.promotionId === p.id);
          return (
            <Card key={p.id} className="p-5">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-red-50 text-red-600">
                  <Tag size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-semibold">{p.label}</h2>
                    <Badge tone={p.active ? 'green' : 'slate'} dot>
                      {p.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="mt-1 text-3xl font-bold text-red-600">−{p.percent} %</p>
                  <p className="mt-2 text-sm text-muted">{linked.length ? `Appliquée à : ${linked.map((x) => x.name).join(', ')}` : 'Aucun produit rattaché.'}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
