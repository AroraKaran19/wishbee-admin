"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { navigationItems } from "@/lib/data/mockData_new";
import { useSessionStore } from "@/stores/sessionStore";
import { canAccessNavItem } from "@/lib/utils/permissions";
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
  ChevronUp,
  LogOut,
  Package,
} from "lucide-react";
import Image from "next/image";

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
  Headphones,
  Package,
};

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useSessionStore((state) => state.logout);
  const admin = useSessionStore((state) => state.admin);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isItemExpanded = (itemId: string) => {
    // Check if item is manually expanded
    if (expandedItems.includes(itemId)) return true;

    // Check if any sub-item is active (auto-expand)
    const item = navigationItems.find((navItem) => navItem.id === itemId);
    if (item?.subItems) {
      return item.subItems.some((subItem) => pathname === subItem.href);
    }

    return false;
  };

  const handleLinkClick = () => {
    // Close sidebar on mobile when a link is clicked
    if (onClose) {
      onClose();
    }
  };

  // Get display name with first letter capitalized
  const getDisplayName = () => {
    if (admin?.firstName) {
      return admin.firstName.charAt(0).toUpperCase() + admin.firstName.slice(1).toLowerCase();
    }
    if (admin?.email) {
      const emailName = admin.email.split("@")[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1).toLowerCase();
    }
    return "Admin";
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col lg:shadow-none shadow-xl">
      <div className="p-6 pb-4">
        <Image
          src="/logo.png"
          alt="Wishbee Logo"
          width={150}
          height={150}
          priority
          unoptimized
          loading="eager"
          fetchPriority="high"
          quality={100}
        />
      </div>

      <div className="px-6 pb-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Hey {getDisplayName()}
        </h2>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto scrollbar-hide">
        <ul className="space-y-1">
          {navigationItems
            .filter((item) => canAccessNavItem(admin, item.id))
            .map((item) => {
            const IconComponent = iconMap[item.icon as keyof typeof iconMap];
            const isActive =
              pathname === item.href ||
              (item.href === "/inventory" &&
                pathname.startsWith("/inventory")) ||
              // (item.href === "/auto-reorders" && pathname.startsWith("/auto-reorders")) ||
              (item.href === "/offers-banners" &&
                pathname.startsWith("/offers-banners")) ||
              (item.href === "/analytics" &&
                pathname.startsWith("/analytics")) ||
              (item.href === "/most-selling" &&
                pathname.startsWith("/most-selling"));
            const isExpanded = isItemExpanded(item.id);

            return (
              <li key={item.id}>
                {item.hasDropdown ? (
                  <>
                    <div
                      className={cn(
                        "flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-white"
                          : "text-text-primary hover:bg-muted"
                      )}
                    >
                      <div
                        className="flex items-center flex-1 cursor-pointer"
                        onClick={() => {
                          router.push(item.href);
                          handleLinkClick();
                        }}
                      >
                        <IconComponent
                          className={cn(
                            "w-5 h-5 mr-3",
                            isActive ? "text-white" : "text-text-primary"
                          )}
                        />
                        {item.label}
                      </div>
                      {item.hasDropdown && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpanded(item.id);
                          }}
                          className={cn(
                            "p-1 rounded hover:bg-black/10 transition-colors cursor-pointer",
                            isActive
                              ? "text-white hover:bg-white/20"
                              : "text-text-primary"
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
                                onClick={handleLinkClick}
                                className={cn(
                                  "block px-3 py-2 rounded-lg text-sm transition-colors ml-4 cursor-pointer",
                                  isSubActive
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-text-secondary hover:bg-muted hover:text-text-primary"
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
                    onClick={handleLinkClick}
                    className={cn(
                      "flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                      isActive
                        ? "bg-primary text-white"
                        : "text-text-primary hover:bg-muted"
                    )}
                  >
                    <div className="flex items-center">
                      <IconComponent
                        className={cn(
                          "w-5 h-5 mr-3",
                          isActive ? "text-white" : "text-text-primary"
                        )}
                      />
                      {item.label}
                    </div>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={async () => {
            try {
              await logout();
              router.push("/login");
            } catch (error) {
              console.error("Logout error:", error);
              // Still redirect to login even if logout fails
              router.push("/login");
            }
          }}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
