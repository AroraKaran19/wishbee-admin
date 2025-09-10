import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  trend: string;
  variant?: 'blue' | 'green' | 'light-blue';
}

export function MetricCard({ 
  title, 
  value, 
  trend, 
  variant = 'blue' 
}: MetricCardProps) {
  const variants = {
    blue: {
      cardBg: 'bg-[#d9f4ff]',
      headerBg: 'bg-[#00b7fb]',
      trendColor: 'text-[#00b7fb]'
    },
    green: {
      cardBg: 'bg-[#dbeed9]',
      headerBg: 'bg-[#0b8f00]',
      trendColor: 'text-[#0b8f00]'
    },
    'light-blue': {
      cardBg: 'bg-[#d9f4ff]',
      headerBg: 'bg-[#00b7fb]',
      trendColor: 'text-[#00b7fb]'
    }
  };

  const currentVariant = variants[variant];

  return (
    <div className={cn('rounded-lg shadow-sm w-fit', currentVariant.cardBg)}>
      <div className="space-y-1">
        <div className={cn('inline-block px-2 pt-2 pb-1 rounded-tr-2xl mr-6 mt-3', currentVariant.headerBg)}>
          <h3 className="text-sm font-medium text-white">{title}</h3>
        </div>
        
        <div className="text-xl font-semibold text-gray-900 mt-3 px-3">{value}</div>
        
        <div className="flex items-center justify-between text-sm px-3 pb-2">
          <span className="text-gray-600 text-sm mr-8">
            {trend.split(' ')[0]} {trend.split(' ')[1]} {trend.split(' ')[2]}
          </span>
          <span className="flex items-center">

          <span className={cn('font-semibold', currentVariant.trendColor)}>
            {trend.split(' ')[3]}
          </span>
          <TrendingUp className={cn('w-4 h-4 ml-1', currentVariant.trendColor)} />
          </span>
        </div>
      </div>
    </div>
  );
}
