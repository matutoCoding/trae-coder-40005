import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isUp: boolean;
  };
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red';
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  orange: 'bg-orange-50 text-orange-600',
  purple: 'bg-purple-50 text-purple-600',
  red: 'bg-red-50 text-red-600',
};

export function StatCard({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  color = 'blue',
}: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-800">{value}</span>
            {unit && <span className="text-sm text-slate-500">{unit}</span>}
          </div>
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              {trend.isUp ? (
                <TrendingUp size={14} className="text-green-500" />
              ) : (
                <TrendingDown size={14} className="text-red-500" />
              )}
              <span
                className={cn(
                  'text-xs font-medium',
                  trend.isUp ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend.isUp ? '+' : ''}
                {trend.value}%
              </span>
              <span className="text-xs text-slate-400">较上周</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'w-12 h-12 rounded-lg flex items-center justify-center',
            colorClasses[color]
          )}
        >
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
