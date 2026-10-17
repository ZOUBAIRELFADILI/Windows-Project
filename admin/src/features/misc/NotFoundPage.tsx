import { Link } from 'react-router-dom';
import { Card } from '@/components/ui';

export function NotFoundPage() {
  return (
    <Card className="mx-auto mt-12 max-w-md p-8 text-center">
      <p className="text-4xl font-bold text-slate-300">404</p>
      <p className="mt-2 font-semibold">Page introuvable</p>
      <Link to="/" className="mt-4 inline-block text-sm font-medium text-brand-700">
        Retour au tableau de bord
      </Link>
    </Card>
  );
}
