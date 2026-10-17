import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { HelpButton } from '@/features/onboarding/HelpButton';
import type { HelpTopic } from '@/features/onboarding/helpContent';

export function PageHeader({
  title,
  subtitle,
  crumbs,
  actions,
  help,
  badge,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  crumbs?: Array<{ label: string; to?: string }>;
  actions?: ReactNode;
  help?: HelpTopic;
  badge?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {crumbs && (
          <nav className="mb-2 flex flex-wrap items-center gap-1 text-xs text-muted">
            {crumbs.map((c, i) => (
              <span key={c.label} className="flex items-center gap-1">
                {c.to ? (
                  <Link to={c.to} className="hover:text-brand-700">
                    {c.label}
                  </Link>
                ) : (
                  <span className="font-medium text-brand-700">{c.label}</span>
                )}
                {i < crumbs.length - 1 && <ChevronRight size={12} />}
              </span>
            ))}
          </nav>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-ink md:text-[28px]">{title}</h1>
          {badge}
          {help && <HelpButton topic={help} />}
        </div>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2 xl:flex-nowrap">{actions}</div>}
    </div>
  );
}
