'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  ChevronDown,
  ChevronUp
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
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isItemExpanded = (itemId: string) => {
    // Check if item is manually expanded
    if (expandedItems.includes(itemId)) return true;
    
    // Check if any sub-item is active (auto-expand)
    const item = navigationItems.find(navItem => navItem.id === itemId);
    if (item?.subItems) {
      return item.subItems.some(subItem => pathname === subItem.href);
    }
    
    return false;
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-6 pb-4">
        <WishBeeLogo />
      </div>

      <div className="px-6 pb-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Hey Raj-</h2>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto scrollbar-hide">
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const IconComponent = iconMap[item.icon as keyof typeof iconMap];
            const isActive = pathname === item.href || (item.href === '/inventory' && pathname.startsWith('/inventory'));
            const isExpanded = isItemExpanded(item.id);
            
            return (
              <li key={item.id}>
                {item.hasDropdown ? (
                  <>
                    <div
                      className={cn(
                        'flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-white'
                          : 'text-text-primary hover:bg-muted'
                      )}
                    >
                      <div 
                        className="flex items-center flex-1 cursor-pointer"
                        onClick={() => router.push(item.href)}
                      >
                        <IconComponent className={cn(
                          'w-5 h-5 mr-3',
                          isActive ? 'text-white' : 'text-text-primary'
                        )} />
                        {item.label}
                      </div>
                      {item.hasDropdown && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpanded(item.id);
                          }}
                          className={cn(
                            'p-1 rounded hover:bg-black hover:bg-opacity-10 transition-colors cursor-pointer',
                            isActive ? 'text-white hover:bg-white hover:bg-opacity-20' : 'text-text-primary'
                          )}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                    
                    {item.hasDropdown && item.subItems && isExpanded && (
                      <ul className="ml-6 mt-1 space-y-1 relative">
                        {/* Vertical line */}
                        <li className="absolute left-0 top-0 bottom-0 w-px bg-gray-300"></li>
                        {item.subItems.map((subItem) => {
                          const isSubActive = pathname === subItem.href;
                          return (
                            <li key={subItem.id} className="relative">
                              {/* Horizontal line connecting to vertical line */}
                              <div className="absolute left-0 top-1/2 w-3 h-[0.5px] bg-gray-300 transform -translate-y-1/2"></div>
                              <Link
                                href={subItem.href}
                                className={cn(
                                  'block px-3 py-2 rounded-lg text-sm transition-colors ml-4',
                                  isSubActive
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-text-secondary hover:bg-muted hover:text-text-primary'
                                )}
                              >
                                {subItem.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </>
                ) : (
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
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
