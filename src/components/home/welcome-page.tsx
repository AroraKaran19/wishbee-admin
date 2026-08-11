"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Package, ShoppingBag, Truck, Users } from "lucide-react";
import { useSessionStore } from "@/stores/sessionStore";
import { orderApi } from "@/lib/api/orders";
import { customerApi } from "@/lib/api/customers";
import { dashboardApi } from "@/lib/api/dashboard";

interface HomeCounts {
  customers: number | null;
  orders: number | null;
  delivered: number | null;
  products: number | null;
}

const TILES: Array<{
  key: keyof HomeCounts;
  label: string;
  icon: typeof Users;
  accent: string;
}> = [
  { key: "customers", label: "Customers", icon: Users, accent: "#00b7fb" },
  { key: "orders", label: "Total Orders", icon: ShoppingBag, accent: "#ff9800" },
  { key: "delivered", label: "Delivered", icon: Truck, accent: "#0b8f00" },
  { key: "products", label: "Products", icon: Package, accent: "#7c3aed" },
];

/**
 * Branded entrance to the admin portal. Deliberately shows volume counts only -
 * no revenue or any other money figure - so it stays safe on a shared screen.
 */
export function WelcomePage() {
  const router = useRouter();
  const admin = useSessionStore((state) => state.admin);

  const [counts, setCounts] = useState<HomeCounts>({
    customers: null,
    orders: null,
    delivered: null,
    products: null,
  });

  useEffect(() => {
    const loadCounts = async () => {
      // Each figure is independent; one failing endpoint should not blank the page.
      const [customers, stats, inventory] = await Promise.allSettled([
        customerApi.getAll({ page: 1, limit: 1 }),
        orderApi.getStats({ period: "all-time" }),
        dashboardApi.getInventory({ page: 1, limit: 1 }),
      ]);

      setCounts({
        customers:
          customers.status === "fulfilled"
            ? customers.value?.pagination?.total ?? 0
            : null,
        orders:
          stats.status === "fulfilled" ? stats.value?.totalOrders ?? 0 : null,
        delivered:
          stats.status === "fulfilled"
            ? stats.value?.totalDelivered ?? 0
            : null,
        products:
          inventory.status === "fulfilled"
            ? inventory.value?.data?.totalProducts ?? 0
            : null,
      });
    };

    loadCounts();
  }, []);

  const displayName = admin?.firstName
    ? admin.firstName.charAt(0).toUpperCase() +
      admin.firstName.slice(1).toLowerCase()
    : null;

  return (
    <div className="flex flex-col items-center justify-center py-10 lg:py-16">
      <div className="w-full max-w-3xl text-center">
        <Image
          src="/logo.png"
          alt="WishBee"
          width={190}
          height={49}
          priority
          className="mx-auto"
          quality={100}
          fetchPriority="high"
        />

        <h1 className="mt-8 text-2xl sm:text-3xl font-bold text-gray-900">
          Welcome to Wishbee Admin Portal
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          {displayName
            ? `Hey ${displayName}, good to see you again.`
            : "Manage your store, orders and customers from one place."}
        </p>

        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {TILES.map((tile) => {
            const Icon = tile.icon;
            const value = counts[tile.key];
            return (
              <div
                key={tile.key}
                className="bg-white rounded-2xl shadow-sm px-4 py-5"
              >
                <Icon
                  className="w-5 h-5 mx-auto"
                  style={{ color: tile.accent }}
                />
                <div className="mt-3 text-2xl font-semibold text-gray-900 tabular-nums leading-none">
                  {value === null ? (
                    <span className="inline-block h-6 w-14 bg-gray-100 rounded animate-pulse align-middle" />
                  ) : (
                    value.toLocaleString("en-IN")
                  )}
                </div>
                <div className="mt-2 text-[11px] font-medium uppercase tracking-wider text-gray-500">
                  {tile.label}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex items-center justify-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#00b7fb] text-white text-sm font-medium hover:bg-[#0099d4] transition-colors cursor-pointer shadow-sm"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
