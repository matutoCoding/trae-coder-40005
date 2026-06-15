import { cn } from '@/utils';

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'pending' | 'sintering';

interface StatusBadgeProps {
  status: StatusType;
  text: string;
  className?: string;
}

const statusClasses: Record<StatusType, string> = {
  success: 'bg-green-50 text-green-700 border-green-200',
  warning: 'bg-orange-50 text-orange-700 border-orange-200',
  error: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  pending: 'bg-slate-100 text-slate-600 border-slate-200',
  sintering: 'bg-amber-50 text-amber-700 border-amber-200',
};

const statusDotColors: Record<StatusType, string> = {
  success: 'bg-green-500',
  warning: 'bg-orange-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  pending: 'bg-slate-400',
  sintering: 'bg-amber-500 animate-pulse',
};

export function StatusBadge({ status, text, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded border',
        statusClasses[status],
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', statusDotColors[status])} />
      {text}
    </span>
  );
}
