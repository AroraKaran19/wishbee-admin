'use client';

import React from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      <div className="flex h-full">
        <Sidebar />
        
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <Header />
          <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
