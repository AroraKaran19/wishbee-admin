"use client";

import React, { useState } from "react";
import { Sidebar } from "./sidebar";
import { ProtectedRoute } from "./protected-route";
import { Menu, X } from "lucide-react";
import Image from "next/image";

export function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <ProtectedRoute>
    <div className="h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Navbar */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between transition-all ${
        sidebarOpen ? 'z-30' : 'z-50'
      }`}>
        <button
          onClick={toggleSidebar}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            !sidebarOpen ? 'hover:bg-gray-100' : ''
          }`}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? (
            <X className="w-6 h-6 text-gray-700" />
          ) : (
            <Menu className="w-6 h-6 text-gray-700 stroke-[2.5]" />
          )}
        </button>
        <div className="flex-1 flex justify-center">
          <Image
            src="/logo.svg"
            alt="Wishbee Logo"
            width={100}
            height={34}
            priority
            className="h-8 w-auto"
          />
        </div>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      <div className="flex h-full pt-14 lg:pt-0">
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* Sidebar */}
        <div
          className={`fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <Sidebar onClose={closeSidebar} />
        </div>

        {/* Main Content */}
        <main className="min-h-screen flex-1 p-4 lg:p-6 overflow-y-auto custom-scrollbar w-full">
          {children}
        </main>
      </div>
    </div>
    </ProtectedRoute>
  );
}
