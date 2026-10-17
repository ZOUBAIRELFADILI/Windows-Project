import { ShieldCheck, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import { useUi } from '@/store/UiStore';
import { TOUR } from './helpContent';

/** Welcome card + 4-step tour. Highlights the target element with an outline. */
export function GuidedTour() {
  const { tourOpen, setTourOpen } = useUi();
  const [step, setStep] = useState(-1); // -1 = welcome
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (step < 0 || !tourOpen) return;
    if (location.pathname !== '/') navigate('/');
    const el = document.querySelector<HTMLElement>(`[data-tour="${TOUR[step].target}"]`);
    if (!el) return;
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    el.classList.add('tour-highlight');
    return () => el.classList.remove('tour-highlight');
  }, [step, tourOpen, location.pathname, navigate]);

  if (!tourOpen) return null;

  const close = () => {
    setTourOpen(false);
    setStep(-1);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-card bg-ink text-white shadow-overlay">
      <div className="flex items-start gap-3 p-5">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-600">
          <ShieldCheck size={20} />
        </div>
        <div className="flex-1">
          {step < 0 ? (
            <>
              <p className="font-semibold">Bienvenue sur Fenêtres Pro !</p>
              <p className="mt-1 text-sm text-slate-300">Découvrez votre espace d’administration en 4 étapes.</p>
            </>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-200">
                Étape {step + 1} sur {TOUR.length}
              </p>
              <p className="mt-1 font-semibold">{TOUR[step].title}</p>
              <p className="mt-1 text-sm text-slate-300">{TOUR[step].text}</p>
            </>
          )}
        </div>
        <button onClick={close} aria-label="Fermer la visite" className="text-slate-400 hover:text-white">
          <X size={18} />
        </button>
      </div>
      <div className="flex items-center justify-between border-t border-white/10 px-5 py-3">
        <div className="flex gap-1.5">
          {TOUR.map((_, i) => (
            <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === step ? 'bg-brand-200' : 'bg-white/25'}`} />
          ))}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" className="text-slate-300 hover:bg-white/10" onClick={close}>
            {step < 0 ? 'Plus tard' : 'Ignorer'}
          </Button>
          <Button size="sm" variant="primary" onClick={() => (step >= TOUR.length - 1 ? close() : setStep(step + 1))}>
            {step < 0 ? 'Démarrer le tour' : step >= TOUR.length - 1 ? 'Terminer' : 'Suivant'}
          </Button>
        </div>
      </div>
    </div>
  );
}
