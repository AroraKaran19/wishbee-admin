'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PermissionGuard } from '@/components/layout/permission-guard';
import { ADMIN_PERMISSIONS } from '@/lib/constants/permissions';
import { shippingApi, type MiniBasketTier } from '@/lib/api/shipping';
import { MiniBasketTiersCard } from '@/components/settings/mini-basket-tiers-card';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Save, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function ShippingPricePage() {
  const [charges, setCharges] = useState<string>('');
  const [miniBasketTiers, setMiniBasketTiers] = useState<MiniBasketTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCharges = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await shippingApi.getCharges();
        const value = res.data?.charges ?? 0;
        setCharges(String(value));
        setMiniBasketTiers(res.data?.miniBasketTiers ?? []);
      } catch (err) {
        console.error('Error fetching shipping charges:', err);
        setError(err instanceof Error ? err.message : 'Failed to load shipping charges');
        toast.error('Failed to load shipping charges');
      } finally {
        setLoading(false);
      }
    };
    fetchCharges();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(charges);
    if (Number.isNaN(num) || num < 0) {
      toast.error('Please enter a valid non-negative amount');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await shippingApi.updateCharges(num);
      toast.success('Shipping price updated successfully');
      setCharges(String(num));
    } catch (err) {
      console.error('Error updating shipping charges:', err);
      const msg = err instanceof Error ? err.message : 'Failed to update shipping price';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <PermissionGuard requiredPermission={ADMIN_PERMISSIONS.SETTINGS}>
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Shipping Price</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Set the delivery charge shown in cart and at checkout. Use 0 for free shipping.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Truck className="h-5 w-5 text-gray-600" />
                Delivery charges
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="charges" className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (₹)
                    </label>
                    <Input
                      id="charges"
                      type="number"
                      min={0}
                      step={1}
                      value={charges}
                      onChange={(e) => setCharges(e.target.value)}
                      placeholder="e.g. 50"
                      className="max-w-xs"
                      disabled={saving}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Current value will be shown as {formatCurrency(parseFloat(charges) || 0)} at checkout.
                    </p>
                  </div>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="cursor-pointer"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save changes
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {!loading && <MiniBasketTiersCard initialTiers={miniBasketTiers} />}

          <p className="text-sm text-gray-500">
            Per-item charges for heavy products are set under{' '}
            <Link href="/settings/heavy-lift" className="text-blue-600 hover:underline">
              Heavy Lift Charge
            </Link>
            .
          </p>
        </div>
      </PermissionGuard>
    </DashboardLayout>
  );
}
