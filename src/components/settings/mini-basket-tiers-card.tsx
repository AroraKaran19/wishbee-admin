'use client';

import { useEffect, useState } from 'react';
import { ShoppingBasket, Plus, Trash2, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { shippingApi, type MiniBasketTier } from '@/lib/api/shipping';
import { formatCurrency } from '@/lib/utils';

interface EditableTier {
  id: number;
  below: string;
  fee: string;
}

let nextId = 1;
const toEditable = (t: MiniBasketTier): EditableTier => ({
  id: nextId++,
  below: String(t.below),
  fee: String(t.fee),
});

export function MiniBasketTiersCard({ initialTiers }: { initialTiers: MiniBasketTier[] }) {
  const [tiers, setTiers] = useState<EditableTier[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTiers(initialTiers.map(toEditable));
  }, [initialTiers]);

  const updateTier = (id: number, field: 'below' | 'fee', value: string) =>
    setTiers((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)));

  const addTier = () =>
    setTiers((prev) => [...prev, { id: nextId++, below: '', fee: '' }]);

  const removeTier = (id: number) => setTiers((prev) => prev.filter((t) => t.id !== id));

  const parsed = tiers.map((t) => ({ below: parseFloat(t.below), fee: parseFloat(t.fee) }));
  const sortedPreview = parsed
    .filter((t) => t.below > 0 && t.fee >= 0)
    .sort((a, b) => a.below - b.below);

  const handleSave = async () => {
    for (const t of parsed) {
      if (!Number.isFinite(t.below) || t.below <= 0) {
        toast.error('Every tier needs an order value above 0');
        return;
      }
      if (!Number.isFinite(t.fee) || t.fee < 0) {
        toast.error('Every tier needs a charge of 0 or more');
        return;
      }
    }
    if (new Set(parsed.map((t) => t.below)).size !== parsed.length) {
      toast.error('Two tiers cannot use the same order value');
      return;
    }

    try {
      setSaving(true);
      const res = await shippingApi.updateMiniBasketTiers(parsed);
      setTiers((res.data?.miniBasketTiers ?? parsed).map(toEditable));
      toast.success('Mini Basket tiers saved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save Mini Basket tiers');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShoppingBasket className="h-5 w-5 text-gray-600" />
          Mini Basket Charge
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-500">
          Charged on small orders, checked against the items total after coupon and loyalty
          discounts. The lowest matching tier applies. Remove every tier to turn it off.
        </p>

        {tiers.length === 0 && (
          <p className="text-sm text-gray-500 italic">No tiers. Mini Basket Charge is off.</p>
        )}

        <div className="space-y-2">
          {tiers.map((t) => (
            <div key={t.id} className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
              <span>Orders below ₹</span>
              <Input
                type="number"
                min={1}
                step={1}
                value={t.below}
                onChange={(e) => updateTier(t.id, 'below', e.target.value)}
                placeholder="e.g. 199"
                className="w-28"
                disabled={saving}
                aria-label="Order value below"
              />
              <span>pay ₹</span>
              <Input
                type="number"
                min={0}
                step={1}
                value={t.fee}
                onChange={(e) => updateTier(t.id, 'fee', e.target.value)}
                placeholder="e.g. 50"
                className="w-24"
                disabled={saving}
                aria-label="Charge"
              />
              <button
                type="button"
                onClick={() => removeTier(t.id)}
                disabled={saving}
                className="p-2 text-gray-400 hover:text-red-600 cursor-pointer"
                aria-label="Remove tier"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {sortedPreview.length > 0 && (
          <ul className="text-xs text-gray-500 space-y-0.5 border-l-2 border-gray-200 pl-3">
            {sortedPreview.map((t, i) => (
              <li key={i}>
                {i === 0 ? 'Below' : `${formatCurrency(sortedPreview[i - 1].below)} to below`}{' '}
                {formatCurrency(t.below)}: {t.fee > 0 ? formatCurrency(t.fee) : 'Free'}
              </li>
            ))}
            <li>
              {formatCurrency(sortedPreview[sortedPreview.length - 1].below)} and above: Free
            </li>
          </ul>
        )}

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={addTier} disabled={saving} className="cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            Add tier
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving} className="cursor-pointer">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save tiers
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
