'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

interface OpeningBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (openingBalance: number) => Promise<void>;
  onSuccess: () => void;
}

export function OpeningBalanceModal({
  isOpen,
  onClose,
  onSubmit,
  onSuccess,
}: OpeningBalanceModalProps) {
  const [openingBalance, setOpeningBalance] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setOpeningBalance('');
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const value = parseFloat(openingBalance);
    if (isNaN(value) || value < 0) {
      setError('Please enter a valid non-negative amount.');
      return;
    }
    try {
      setIsSubmitting(true);
      await onSubmit(value);
      toast.success('Opening balance set successfully');
      onSuccess();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to set opening balance';
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Set opening balance" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-500">
          Enter the cash balance at the start of your shift (in ₹).
        </p>
        <div>
          <label htmlFor="opening-balance" className="block text-sm font-medium text-gray-700 mb-1">
            Opening balance (₹)
          </label>
          <input
            id="opening-balance"
            type="number"
            min="0"
            step="0.01"
            value={openingBalance}
            onChange={(e) => setOpeningBalance(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#13aaff] focus:border-transparent"
            placeholder="0.00"
            autoFocus
          />
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Set opening balance'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
