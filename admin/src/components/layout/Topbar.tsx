import { ExternalLink, Menu, Search, Sparkles } from 'lucide-react';
import { useUi } from '@/store/UiStore';

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { setAssistantOpen, assistantOpen, toast } = useUi();
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-white/90 px-4 backdrop-blur md:px-8">
      <button className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={onMenu} aria-label="Ouvrir le menu">
        <Menu size={20} />
      </button>
      <div className="relative hidden max-w-md flex-1 md:block">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          placeholder="Rechercher un produit, une option, une commande…"
          className="h-10 w-full rounded-lg border border-line bg-canvas pl-9 pr-3 text-sm focus:border-brand-600 focus:outline-none"
        />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Brouillon sauvegardé
        </span>
        <button
          onClick={() => toast('La boutique sera branchée au configurateur client.')}
          className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 md:flex"
        >
          <ExternalLink size={16} /> Aperçu boutique
        </button>
        <button
          data-tour="assistant"
          onClick={() => setAssistantOpen(!assistantOpen)}
          className="flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100"
        >
          <Sparkles size={16} /> <span className="hidden sm:inline">Assistant IA</span>
        </button>
        <div className="ml-1 flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-ink text-xs font-semibold text-white">AD</div>
          <div className="hidden leading-tight xl:block">
            <p className="text-sm font-semibold text-ink">Admin</p>
            <p className="text-xs text-muted">Propriétaire</p>
          </div>
        </div>
      </div>
    </header>
  );
}
