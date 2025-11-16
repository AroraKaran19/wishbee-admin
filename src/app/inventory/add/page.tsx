"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PermissionGuard } from "@/components/layout/permission-guard";
import { ADMIN_PERMISSIONS } from "@/lib/constants/permissions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, Layers, Plus } from "lucide-react";

export default function InventoryAddPage() {
  const router = useRouter();

  return (
    <DashboardLayout>
      <PermissionGuard requiredPermission={ADMIN_PERMISSIONS.INVENTORY}>
        <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => router.push("/inventory")}
            className="p-1 hover:bg-gray-100 cursor-pointer rounded-md transition-colors"
            aria-label="Go back to inventory"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Add New Item</h1>
        </div>
        <p className="text-gray-500 mt-1 text-sm">
          Choose the type of item you want to add to your inventory.
        </p>
      </div>

      <div className="h-full flex flex-col gap-6 max-w-lg mx-auto justify-center items-center">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Add Product
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  Add individual products with detailed information, pricing,
                  and inventory management.
                </p>
              </div>
              <Button
                variant="primary"
                onClick={() => router.push("/inventory/add/product")}
                className="w-full"
                icon={<Plus className="w-4 h-4" />}
              >
                Add Product
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <Layers className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Add Combo
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  Create product combinations and bundles with special pricing
                  and offers.
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={() => router.push("/inventory/add/combo")}
                className="w-full"
                icon={<Plus className="w-4 h-4" />}
              >
                Add Combo
              </Button>
            </div>
          </CardContent>
        </Card> */}
      </div>
      </PermissionGuard>
    </DashboardLayout>
  );
}
