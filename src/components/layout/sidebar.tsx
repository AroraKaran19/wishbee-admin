'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { navigationItems } from '@/lib/data/mockData';
import { WishBeeLogo } from '@/components/icons/wishbee-logo';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  List, 
  Users, 
  RotateCcw, 
  Tag, 
  BarChart3, 
  Settings, 
  UserCheck, 
  Headphones,
  ChevronDown
} from 'lucide-react';

const iconMap = {
  LayoutDashboard,
  ShoppingCart,
  List,
  Users,
  RotateCcw,
  Tag,
  BarChart3,
  Settings,
  UserCheck,
  Headphones
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-6 pb-4">
        <WishBeeLogo />
      </div>

      <div className="px-6 pb-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Hey Raj-</h2>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const IconComponent = iconMap[item.icon as keyof typeof iconMap];
            const isActive = pathname === item.href;
            
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-text-primary hover:bg-muted'
                  )}
                >
                  <div className="flex items-center">
                    <IconComponent className={cn(
                      'w-5 h-5 mr-3',
                      isActive ? 'text-white' : 'text-text-primary'
                    )} />
                    {item.label}
                  </div>
                  {item.hasDropdown && (
                    <ChevronDown className={cn(
                      'w-4 h-4',
                      isActive ? 'text-white' : 'text-text-primary'
                    )} />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
