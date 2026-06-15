import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils';
export { StatusBadge } from './StatusBadge';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

export function FormField({ label, required, error, className, children }: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ error, className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors',
        error
          ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
          : 'border-slate-300 focus:border-blue-500',
        className
      )}
      {...props}
    />
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options: { value: string; label: string; disabled?: boolean }[];
}

export function Select({ error, options, className, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        'w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors bg-white',
        error
          ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
          : 'border-slate-300 focus:border-blue-500',
        className
      )}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} disabled={opt.disabled}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function Textarea({ error, className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none',
        error
          ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
          : 'border-slate-300 focus:border-blue-500',
        className
      )}
      {...props}
    />
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500/30',
    secondary:
      'bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-500/20',
    outline:
      'border border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-slate-500/20',
    ghost: 'text-slate-600 hover:bg-slate-100 focus:ring-slate-500/20',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/30',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-base',
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
