import { PlayCircle, RotateCcw } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Card } from '@/components/ui';
import { useAdmin } from '@/store/AdminStore';
import { useUi } from '@/store/UiStore';

export function SettingsPage() {
  const { dispatch } = useAdmin();
  const { setTourOpen, toast } = useUi();
  return (
    <>
      <PageHeader title="Paramètres" subtitle="Réglages de la maquette." help="settings" />
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-semibold">Données de démonstration</h2>
          <p className="mt-1 text-sm text-muted">Vos modifications sont gardées dans ce navigateur. Réinitialisez pour revenir aux données d’origine.</p>
          <Button
            variant="danger"
            className="mt-4"
            icon={<RotateCcw size={16} />}
            onClick={() => {
              dispatch({ type: 'reset' });
              toast('Données de démonstration réinitialisées.');
            }}
          >
            Réinitialiser
          </Button>
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold">Visite guidée</h2>
          <p className="mt-1 text-sm text-muted">Pour un nouvel employé : rejouez la présentation en 4 étapes.</p>
          <Button className="mt-4" icon={<PlayCircle size={16} />} onClick={() => setTourOpen(true)}>
            Relancer la visite
          </Button>
        </Card>
      </div>
    </>
  );
}
