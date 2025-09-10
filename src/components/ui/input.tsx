import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'muted';
}

export function Input({ icon, rightIcon, className, variant = 'default', ...props }: InputProps) {
  const variants = {
    default: 'border-gray-300 bg-white',
    muted: 'border-gray-200 bg-muted'
  };

  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <input
        className={cn(
          'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          variants[variant],
          icon && 'pl-10',
          rightIcon && 'pr-10',
          className
        )}
        {...props}
      />
      {rightIcon && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {rightIcon}
        </div>
      )}
    </div>
  );
}
