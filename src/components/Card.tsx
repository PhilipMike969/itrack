import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Card({ children, className, style }: CardProps) {
  return (
    <div 
      className={cn(
        'rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900',
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, style }: CardProps) {
  return (
    <div className={cn('p-6 pb-3', className)} style={style}>
      {children}
    </div>
  );
}

export function CardContent({ children, className, style }: CardProps) {
  return (
    <div className={cn('p-6 pt-0', className)} style={style}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, style }: CardProps) {
  return (
    <h3 className={cn('text-lg font-semibold text-slate-900 dark:text-slate-100', className)} style={style}>
      {children}
    </h3>
  );
}
