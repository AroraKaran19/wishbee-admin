import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'danger' | 'warning' | 'primary' | 'muted';
  className?: string;
}

export function Badge({ children, variant = 'primary', className }: BadgeProps) {
  const variants = {
    success: 'bg-success-light text-success',
    danger: 'bg-danger-light text-danger',
    warning: 'bg-warning text-gray-900',
    primary: 'bg-primary-light text-primary',
    muted: 'bg-muted text-text-secondary'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
