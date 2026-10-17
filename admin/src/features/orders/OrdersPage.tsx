import { clsx } from 'clsx';
import { Copy, Download, FileText, Mail, MapPin, Phone, Search, Send, User, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge, Button, Card } from '@/components/ui';
import { WindowDrawing } from '@/components/visuals';
import { formatDate, formatDateTime, formatEuro, ORDER_STATUS } from '@/lib/format';
import { surfaceM2 } from '@/lib/pricing';
import { useAdmin } from '@/store/AdminStore';
import { useUi } from '@/store/UiStore';
import type { Order, OrderStatus } from '@/types/domain';
import { PriceSummary } from '@/features/products/editor/PriceSummary';

const FILTERS: Array<{ id: OrderStatus | 'all'; label: string }> = [
  { id: 'all', label: 'Toutes' },
  ...(Object.keys(ORDER_STATUS) as OrderStatus[]).map((id) => ({ id, label: ORDER_STATUS[id].label })),
];

export function OrdersPage() {
  const { orders } = useAdmin();
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [query, setQuery] = useState('');

  const rows = useMemo(
    () =>
      orders.filter(
        (o) => (filter === 'all' || o.status === filter) && `${o.id} ${o.customer.name} ${o.productName}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [orders, filter, query],
  );
  const selected = orders.find((o) => o.id === orderId);

  return (
    <>
      <PageHeader
        title="Commandes"
        subtitle="Chaque commande garde le prix du jour où elle a été passée."
        help="orders"
        actions={<Button icon={<Download size={16} />}>Exporter (.csv)</Button>}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const count = f.id === 'all' ? orders.length : orders.filter((o) => o.status === f.id).length;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={clsx('flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium', filter === f.id ? 'border-ink bg-ink text-white' : 'border-line bg-white text-slate-700 hover:border-slate-300')}
            >
              {f.label}
              <span className={clsx('rounded px-1.5 text-xs', filter === f.id ? 'bg-white/20' : 'bg-slate-100')}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className={clsx('grid items-start gap-6', selected && 'xl:grid-cols-[minmax(0,1fr)_440px]')}>
        <Card className="overflow-hidden">
          <div className="border-b border-line p-4">
            <div className="relative max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="N° de commande, client, produit…" className="h-10 w-full rounded-lg border border-line bg-canvas pl-9 pr-3 text-sm focus:border-brand-600 focus:outline-none" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-canvas text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">N° commande</th>
                  {!selected && <th className="px-4 py-3 font-semibold">Date</th>}
                  <th className="px-4 py-3 font-semibold">Client</th>
                  {!selected && <th className="px-4 py-3 font-semibold">Produit</th>}
                  <th className="px-4 py-3 text-right font-semibold">Montant TTC</th>
                  <th className="px-4 py-3 font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => navigate(`/commandes/${o.id}`)}
                    className={clsx('cursor-pointer transition-colors hover:bg-canvas', o.id === orderId && 'bg-brand-50/60')}
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-brand-700">{o.id}</td>
                    {!selected && <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDate(o.date)}</td>}
                    <td className="px-4 py-3">
                      <p className="whitespace-nowrap font-medium">{o.customer.name}</p>
                      <p className="whitespace-nowrap text-xs text-muted">{selected ? o.productName : o.customer.city}</p>
                    </td>
                    {!selected && <td className="whitespace-nowrap px-4 py-3">{o.productName}</td>}
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold">{formatEuro(o.snapshot.total)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={ORDER_STATUS[o.status].tone} dot>
                        {ORDER_STATUS[o.status].label}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 && <p className="p-8 text-center text-sm text-muted">Aucune commande ne correspond.</p>}
          </div>
        </Card>

        {selected && <OrderDetail order={selected} onClose={() => navigate('/commandes')} />}
      </div>
    </>
  );
}

function OrderDetail({ order, onClose }: { order: Order; onClose: () => void }) {
  const { dispatch, getProduct } = useAdmin();
  const { toast } = useUi();
  const product = getProduct(order.productId);
  const c = order.configuration;
  const panels = product?.steps.find((s) => s.id === 'panels')?.options.find((o) => c?.selections.panels?.includes(o.id))?.panels ?? 2;
  const wood = product?.steps.find((s) => s.id === 'wood')?.options.find((o) => c?.selections.wood?.includes(o.id))?.visual;
  const alu = product?.steps.find((s) => s.id === 'alu')?.options.find((o) => c?.selections.alu?.includes(o.id))?.visual;

  const chosen =
    product?.steps
      .filter((s) => s.kind !== 'dimensions' && c?.selections[s.id]?.length)
      .map((s) => ({ step: s.title, value: s.options.filter((o) => c?.selections[s.id]?.includes(o.id)).map((o) => o.name).join(', ') })) ?? [];

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-brand-700">{order.id}</h2>
              <button onClick={() => (navigator.clipboard?.writeText(order.id), toast('Numéro copié.'))} aria-label="Copier" className="text-slate-400 hover:text-ink">
                <Copy size={14} />
              </button>
            </div>
            <p className="text-xs text-muted">Commandée le {formatDateTime(order.date)}</p>
          </div>
          <button onClick={onClose} aria-label="Fermer" className="rounded-lg p-1 text-slate-500 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm text-muted">Statut :</span>
          <select
            value={order.status}
            onChange={(e) => {
              dispatch({ type: 'order/status', orderId: order.id, status: e.target.value as OrderStatus });
              toast('Statut mis à jour.');
            }}
            className="h-9 rounded-lg border border-line bg-white px-2 text-sm font-medium"
          >
            {(Object.keys(ORDER_STATUS) as OrderStatus[]).map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS[s].label}
              </option>
            ))}
          </select>
        </div>
        <ul className="mt-4 space-y-2 rounded-xl bg-canvas p-4 text-sm">
          <li className="flex items-center gap-2 font-semibold">
            <User size={15} className="text-slate-400" /> {order.customer.name}
          </li>
          <li className="flex items-center gap-2 text-slate-600">
            <Mail size={15} className="text-slate-400" /> {order.customer.email}
          </li>
          <li className="flex items-center gap-2 text-slate-600">
            <Phone size={15} className="text-slate-400" /> {order.customer.phone}
          </li>
          <li className="flex items-center gap-2 text-slate-600">
            <MapPin size={15} className="text-slate-400" /> {order.customer.address}
          </li>
        </ul>
      </Card>

      {c && (
        <Card className="p-5">
          <h3 className="font-semibold">Fiche technique — {order.productName}</h3>
          <div className="mt-3 rounded-xl bg-canvas p-3">
            <WindowDrawing panels={panels} frame={alu?.type === 'color' ? alu.hex : undefined} wood={wood?.type === 'wood' ? wood.tone : undefined} width={c.width} height={c.height} />
          </div>
          <p className="mt-2 text-xs text-muted">
            Surface : {surfaceM2(c.width, c.height).toString().replace('.', ',')} m²
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            {chosen.map((x) => (
              <div key={x.step} className="rounded-lg border border-line px-3 py-2">
                <dt className="text-[11px] text-muted">{x.step}</dt>
                <dd className="font-medium">{x.value}</dd>
              </div>
            ))}
          </dl>
        </Card>
      )}

      <PriceSummary quote={order.snapshot} title="Détail du prix (à la date de commande)" />

      <div className="grid grid-cols-2 gap-2">
        <Button variant="primary" className="col-span-2" icon={<FileText size={16} />} onClick={() => window.print()}>
          Télécharger la fiche de fabrication
        </Button>
        <Button icon={<Send size={15} />} onClick={() => toast('Récapitulatif envoyé au client (démo).')}>
          Envoyer au client
        </Button>
        <Button variant="danger" onClick={() => toast('Annulation : disponible avec l’API.')}>
          Annuler
        </Button>
      </div>
    </div>
  );
}
