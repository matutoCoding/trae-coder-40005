import { ReactNode } from 'react';
import { cn } from '@/utils';

interface PageCardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}

export function PageCard({
  title,
  subtitle,
  children,
  className,
  actions,
}: PageCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-sm border border-slate-200',
        className
      )}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div>
            {title && (
              <h3 className="text-base font-semibold text-slate-800">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
