import type { OrderStatus, PriceRule } from '@/types/domain';

const euro = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
const euro0 = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const num = new Intl.NumberFormat('fr-FR');

export const formatEuro = (n: number) => euro.format(n);
export const formatEuro0 = (n: number) => euro0.format(n);
export const formatNumber = (n: number) => num.format(n);
export const formatSigned = (n: number) => (n === 0 ? 'Inclus' : `${n > 0 ? '+ ' : '− '}${euro.format(Math.abs(n))}`);

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

/** Short badge text shown on option cards. */
export function priceBadge(rule: PriceRule): string {
  switch (rule.kind) {
    case 'included':
      return 'Inclus';
    case 'percent':
      return `${rule.value >= 0 ? '+' : '−'} ${Math.abs(rule.value)} %`;
    case 'fixed':
      return `+ ${rule.value.toFixed(2).replace('.', ',')} €`;
    case 'perM2':
      return `${rule.value.toFixed(2).replace('.', ',')} €/m²`;
  }
}

export const ORDER_STATUS: Record<OrderStatus, { label: string; tone: 'blue' | 'amber' | 'violet' | 'sky' | 'green' }> = {
  new: { label: 'Nouvelle', tone: 'blue' },
  production: { label: 'En production', tone: 'amber' },
  manufacturing: { label: 'En fabrication', tone: 'violet' },
  shipped: { label: 'Expédiée', tone: 'sky' },
  delivered: { label: 'Livrée', tone: 'green' },
};
