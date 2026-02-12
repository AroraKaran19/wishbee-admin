'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PermissionGuard } from '@/components/layout/permission-guard';
import { ADMIN_PERMISSIONS } from '@/lib/constants/permissions';
import {
  loyaltyApi,
  type LoyaltyTierConfigResponse,
  type LoyaltyTierName,
  type LoyaltyTierThreshold,
} from '@/lib/api/loyalty';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const ALL_TIERS: LoyaltyTierName[] = [
  'BRONZE',
  'SILVER',
  'GOLD',
  'TITANIUM',
  'PLATINUM',
  'DIAMOND',
  'KOHINOOR',
];

interface EditableThreshold extends LoyaltyTierThreshold {
  id: string;
}

export default function LoyaltyTiersSettingsPage() {
  const [thresholds, setThresholds] = useState<EditableThreshold[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derived: quick lookup map
  const thresholdsMap = useMemo(() => {
    const map = new Map<LoyaltyTierName, EditableThreshold>();
    thresholds.forEach((t) => map.set(t.tier, t));
    return map;
  }, [thresholds]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        setError(null);
        const res: LoyaltyTierConfigResponse = await loyaltyApi.getConfig();
        const apiThresholds = res.data?.thresholds ?? [];

        // Ensure all tiers are present with sensible defaults
        const byTier = new Map<LoyaltyTierName, LoyaltyTierThreshold>();
        apiThresholds.forEach((t) => {
          byTier.set(t.tier, {
            amount: Number(t.amount) || 0,
            tier: t.tier,
            discountPercentage:
              typeof (t as any).discountPercentage === 'number'
                ? (t as any).discountPercentage
                : 0,
          });
        });

        const complete: EditableThreshold[] = ALL_TIERS.map((tier) => {
          const existing = byTier.get(tier);
          const defaultAmount = tier === 'BRONZE' ? 0 : 0;
          return {
            id: tier,
            tier,
            amount: existing ? Number(existing.amount) || 0 : defaultAmount,
            discountPercentage:
              typeof existing?.discountPercentage === 'number'
                ? existing.discountPercentage
                : 0,
          };
        });

        // Sort by configured amount ascending
        complete.sort((a, b) => a.amount - b.amount);
        setThresholds(complete);
      } catch (err) {
        console.error('Error fetching loyalty tier config:', err);
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to load loyalty tier configuration';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleAmountChange = (id: string, value: string) => {
    const num = Number(value.replace(/[^0-9.]/g, ''));
    if (Number.isNaN(num)) {
      setThresholds((prev) =>
        prev.map((t) => (t.id === id ? { ...t, amount: 0 } : t)),
      );
    } else {
      setThresholds((prev) =>
        prev.map((t) => (t.id === id ? { ...t, amount: num } : t)),
      );
    }
  };

  const handleDiscountChange = (id: string, value: string) => {
    const num = Number(value.replace(/[^0-9.]/g, ''));
    const safe = Number.isNaN(num) ? 0 : Math.min(Math.max(num, 0), 100);
    setThresholds((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, discountPercentage: safe } : t,
      ),
    );
  };

  const normalizeForSave = (items: EditableThreshold[]): LoyaltyTierThreshold[] => {
    const uniqueByTier = new Map<LoyaltyTierName, LoyaltyTierThreshold>();

    items.forEach((t) => {
      const amount = Number(t.amount) || 0;
      const discount =
        typeof t.discountPercentage === 'number' ? t.discountPercentage : 0;
      const existing = uniqueByTier.get(t.tier);
      if (!existing || amount < existing.amount) {
        uniqueByTier.set(t.tier, {
          tier: t.tier,
          amount,
          discountPercentage: discount,
        });
      }
    });

    // Ensure BRONZE exists and is 0 (or minimum)
    const bronze = uniqueByTier.get('BRONZE') || {
      tier: 'BRONZE',
      amount: 0,
      discountPercentage:
        uniqueByTier.get('BRONZE')?.discountPercentage ?? 0,
    };
    bronze.amount = 0;
    uniqueByTier.set('BRONZE', bronze);

    const arr = Array.from(uniqueByTier.values());
    arr.sort((a, b) => a.amount - b.amount);
    return arr;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thresholds.length) return;

    // Basic validation
    for (const t of thresholds) {
      if (t.amount < 0) {
        toast.error('Amounts must be non-negative');
        return;
      }
    }

    try {
      setSaving(true);
      setError(null);

      const payload = normalizeForSave(thresholds);
      await loyaltyApi.updateConfig(payload);

      toast.success('Loyalty tier thresholds updated successfully');
      // Re-normalize local state to what we sent
      setThresholds(
        payload.map((t) => ({
          ...t,
          id: t.tier,
        })),
      );
    } catch (err) {
      console.error('Error updating loyalty tier config:', err);
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to update loyalty tier configuration';
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <PermissionGuard requiredPermission={ADMIN_PERMISSIONS.SETTINGS}>
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Loyalty tiers (spend-based)
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Configure total-spend thresholds and default discount percentages for each
              loyalty tier. When a customer&apos;s total spend meets or exceeds a
              tier&apos;s amount, they are promoted to that tier and can receive the
              configured discount.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Star className="h-5 w-5 text-yellow-500" />
                Loyalty tier thresholds
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-500">
                          <th className="py-2 pr-4">Tier</th>
                          <th className="py-2 pr-4">Threshold amount (₹)</th>
                          <th className="py-2 pr-4">Discount (%)</th>
                          <th className="py-2 pr-4 text-xs font-normal text-gray-400">
                            Notes
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {thresholds.map((t) => (
                          <tr
                            key={t.id}
                            className="border-b border-gray-100 last:border-b-0"
                          >
                            <td className="py-3 pr-4 font-medium text-gray-800">
                              {t.tier.charAt(0) +
                                t.tier.slice(1).toLowerCase()}
                            </td>
                            <td className="py-3 pr-4">
                              <Input
                                type="number"
                                min={0}
                                step={100}
                                value={Number.isNaN(t.amount) ? '' : String(t.amount)}
                                onChange={(e) =>
                                  handleAmountChange(t.id, e.target.value)
                                }
                                className="max-w-xs"
                                disabled={saving || t.tier === 'BRONZE'}
                              />
                            </td>
                            <td className="py-3 pr-4">
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                step={1}
                                value={
                                  typeof t.discountPercentage === 'number'
                                    ? String(t.discountPercentage)
                                    : ''
                                }
                                onChange={(e) =>
                                  handleDiscountChange(t.id, e.target.value)
                                }
                                className="max-w-xs"
                                disabled={saving}
                              />
                            </td>
                            <td className="py-3 pr-4 text-xs text-gray-500">
                              {t.tier === 'BRONZE'
                                ? 'Base tier for all customers (always 0). Discount is optional.'
                                : 'Customer is upgraded when total spend ≥ this amount and can get this % discount.'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <p>
                      Changes affect future loyalty calculations when orders are marked
                      as DELIVERED. Existing customers will be recalculated based on
                      their total spend.
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
                      'Save changes'
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </PermissionGuard>
    </DashboardLayout>
  );
}

