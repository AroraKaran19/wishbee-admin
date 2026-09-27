'use client';

import { useState } from 'react';
import { Check, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface NewGroupRowProps {
  onCreate: (name: string, fee: number) => Promise<boolean>;
  onCancel: () => void;
}

export function NewGroupRow({ onCreate, onCancel }: NewGroupRowProps) {
  const [name, setName] = useState('');
  const [fee, setFee] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    const ok = await onCreate(name, parseFloat(fee));
    setSaving(false);
    if (ok) onCancel();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 bg-primary-light/40 px-3 py-2 pl-12">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Group name, e.g. 10 to 15 kg"
        aria-label="Group name"
        className="h-8 w-56 py-1 text-sm"
        autoFocus
        disabled={saving}
      />
      <span className="text-sm text-gray-500">₹</span>
      <Input
        type="number"
        min={0}
        step={1}
        value={fee}
        onChange={(e) => setFee(e.target.value)}
        onKeyDown={handleKey}
        placeholder="10"
        aria-label="Charge per unit"
        className="h-8 w-20 py-1 text-sm"
        disabled={saving}
      />
      <span className="text-sm text-gray-500">per unit</span>
      <button
        type="button"
        onClick={submit}
        disabled={saving}
        className="rounded-md p-1.5 text-green-600 hover:bg-muted cursor-pointer disabled:opacity-50"
        aria-label="Create group"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="rounded-md p-1.5 text-gray-400 hover:bg-muted hover:text-gray-700 cursor-pointer"
        aria-label="Cancel"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
