import { clsx } from 'clsx';
import { BookOpen, LayoutDashboard, Package, PlayCircle, Settings, ShoppingBag, SlidersHorizontal, Tag, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAdmin } from '@/store/AdminStore';
import { useUi } from '@/store/UiStore';

const NAV = [
  { to: '/', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/produits', label: 'Produits', icon: Package },
  { to: '/bibliotheque', label: 'Bibliothèque d’options', icon: SlidersHorizontal },
  { to: '/promotions', label: 'Promotions', icon: Tag },
  { to: '/commandes', label: 'Commandes', icon: ShoppingBag, badge: 'orders' as const },
  { to: '/parametres', label: 'Paramètres', icon: Settings },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { orders } = useAdmin();
  const { setTourOpen } = useUi();
  const newOrders = orders.filter((o) => o.status === 'new').length;

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-ink/40 lg:hidden" onClick={onClose} />}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-30 flex w-[260px] flex-col bg-ink text-slate-300 transition-transform lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-600 font-bold text-white">FP</div>
            <div>
              <p className="font-semibold leading-tight text-white">Fenêtres Pro</p>
              <p className="text-[11px] uppercase tracking-wider text-slate-400">Sur mesure</p>
            </div>
          </div>
          <button className="rounded p-1 text-slate-400 hover:text-white lg:hidden" onClick={onClose} aria-label="Fermer le menu">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3" data-tour="nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive ? 'bg-brand-600 text-white' : 'hover:bg-white/5 hover:text-white',
                )
              }
            >
              <item.icon size={18} />
              <span className="flex-1">{item.label}</span>
              {item.badge && newOrders > 0 && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-semibold text-white">{newOrders}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-2 p-3">
          <a href="#aide" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-white/5 hover:text-white">
            <BookOpen size={18} /> Guides & vidéos
          </a>
          <button
            onClick={() => setTourOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 px-3 py-2.5 text-sm font-semibold text-white hover:bg-white/15"
          >
            <PlayCircle size={16} /> Visite guidée
          </button>
        </div>
      </aside>
    </>
  );
}
