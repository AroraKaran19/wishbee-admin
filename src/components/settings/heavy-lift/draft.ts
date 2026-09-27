import type { HeavyLiftGroup, HeavyLiftGroupProduct } from '@/lib/api/heavy-lift';

export const NEW_GROUP_ID = 'new';

export interface GroupDraft {
  name: string;
  fee: string;
  products: HeavyLiftGroupProduct[];
}

export const draftFromGroup = (group: HeavyLiftGroup): GroupDraft => ({
  name: group.name,
  fee: String(group.fee),
  products: group.products,
});

export const emptyGroup: HeavyLiftGroup = { _id: NEW_GROUP_ID, name: '', fee: 0, products: [] };

export const diffDraft = (saved: HeavyLiftGroup, draft: GroupDraft) => {
  const savedIds = new Set(saved.products.map((p) => p._id));
  const draftIds = new Set(draft.products.map((p) => p._id));
  const added = draft.products.filter((p) => !savedIds.has(p._id));
  const removed = saved.products.filter((p) => !draftIds.has(p._id));
  const nameChanged = draft.name.trim() !== saved.name;
  const feeChanged = parseFloat(draft.fee) !== saved.fee;
  return {
    added,
    removed,
    nameChanged,
    feeChanged,
    productsChanged: added.length > 0 || removed.length > 0,
    count: added.length + removed.length + (nameChanged ? 1 : 0) + (feeChanged ? 1 : 0),
  };
};

export const validateDraft = (draft: GroupDraft): string | null => {
  if (!draft.name.trim()) return 'Give the group a name, for example 10 to 15 kg.';
  const fee = parseFloat(draft.fee);
  if (!Number.isFinite(fee) || fee < 0) return 'Enter a charge per unit of ₹0 or more.';
  return null;
};
