import { clsx } from 'clsx';
import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AssistantPanel } from '@/features/assistant/AssistantPanel';
import { GuidedTour } from '@/features/onboarding/GuidedTour';
import { useUi } from '@/store/UiStore';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { assistantOpen, toasts } = useUi();

  return (
    <div className="min-h-screen bg-canvas font-sans text-ink">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className={clsx('transition-[padding] lg:pl-[260px]', assistantOpen && 'xl:pr-[400px]')}>
        <Topbar onMenu={() => setMenuOpen(true)} />
        <main className="mx-auto max-w-[1440px] px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
      <AssistantPanel />
      <GuidedTour />
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 flex-col items-center gap-2">
        {toasts.map((t) => (
          <div key={t.id} className="flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-overlay">
            <CheckCircle2 size={16} className="text-emerald-400" /> {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}
