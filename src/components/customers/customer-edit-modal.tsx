'use client';

import React, { useState, useEffect } from 'react';
import { Customer } from '@/lib/types';
import { customerApi } from '@/lib/api/customers';
import { X, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

interface CustomerEditModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onCustomerUpdate?: () => Promise<void>;
}

const LOYALTY_TIERS = [
  { value: 'BRONZE', label: 'Bronze' },
  { value: 'SILVER', label: 'Silver' },
  { value: 'GOLD', label: 'Gold' },
  { value: 'PLATINUM', label: 'Platinum' },
  { value: 'DIAMOND', label: 'Diamond' },
];

const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
];

const GOVT_ID_TYPES = [
  { value: 'GST', label: 'GST' },
  { value: 'PAN', label: 'PAN' },
  { value: 'UDYAM', label: 'Udyam' },
  { value: 'SHOP_LICENSE', label: 'Shop License' },
  { value: 'OTHER', label: 'Other' },
];

export function CustomerEditModal({
  customer,
  isOpen,
  onClose,
  onCustomerUpdate,
}: CustomerEditModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
    isActive: true,
    govtIdType: '' as '' | 'GST' | 'PAN' | 'UDYAM' | 'SHOP_LICENSE' | 'OTHER',
    govtIdNumber: '',
    storeName: '',
    loyaltyTier: 'BRONZE' as 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND',
    loyaltyPoints: 0,
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch full customer details and initialize form data when modal opens
  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (isOpen && customer) {
        setIsLoading(true);
        setError(null);
        
        try {
          // Fetch full customer details from API (raw user data)
          const apiUser = await customerApi.getById(customer.id);
          
          // Use raw API data to populate form
          setFormData({
            firstName: apiUser.firstName || '',
            lastName: apiUser.lastName || '',
            email: apiUser.email || '',
            gender: apiUser.gender || 'MALE',
            isActive: apiUser.isActive !== undefined ? apiUser.isActive : true,
            govtIdType: apiUser.govtId?.type || '',
            govtIdNumber: apiUser.govtId?.number || '',
            storeName: apiUser.storeName || '',
            loyaltyTier: apiUser.loyaltyTier || 'BRONZE',
            loyaltyPoints: apiUser.loyaltyPoints || 0,
            password: '', // Password field is always empty (for security)
          });
          setShowPassword(false);
        } catch (err) {
          console.error('Error fetching customer details:', err);
          // Fallback to using customer data from list
          const nameParts = customer.name.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          const mapLoyaltyTierToAPI = (tier: string): 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND' => {
            const tierMap: Record<string, 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND'> = {
              'Bronze': 'BRONZE',
              'Silver': 'SILVER',
              'Gold': 'GOLD',
              'Platinum': 'PLATINUM',
              'Diamond': 'DIAMOND',
            };
            return tierMap[tier] || 'BRONZE';
          };

          setFormData({
            firstName,
            lastName,
            email: customer.email === 'N/A' ? '' : customer.email,
            gender: 'MALE',
            isActive: customer.status === 'Active',
            govtIdType: '',
            govtIdNumber: '',
            storeName: '',
            loyaltyTier: mapLoyaltyTierToAPI(customer.loyaltyTier),
            loyaltyPoints: 0,
            password: '',
          });
          setShowPassword(false);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchCustomerDetails();
  }, [isOpen, customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;

    setIsUpdating(true);
    setError(null);

    try {
      // Prepare update data (only include fields that have values)
      const updateData: any = {};
      
      if (formData.firstName) updateData.firstName = formData.firstName;
      if (formData.lastName) updateData.lastName = formData.lastName;
      if (formData.email) updateData.email = formData.email;
      if (formData.gender) updateData.gender = formData.gender;
      updateData.isActive = formData.isActive;
      // Include govtId if both type and number are provided
      if (formData.govtIdType && formData.govtIdNumber) {
        updateData.govtId = {
          type: formData.govtIdType,
          number: formData.govtIdNumber,
        };
      }
      if (formData.storeName) updateData.storeName = formData.storeName;
      if (formData.loyaltyTier) updateData.loyaltyTier = formData.loyaltyTier;
      if (formData.loyaltyPoints !== undefined && formData.loyaltyPoints !== null) {
        updateData.loyaltyPoints = formData.loyaltyPoints;
      }
      // Only include password if it's been entered
      if (formData.password && formData.password.trim() !== '') {
        updateData.password = formData.password;
      }

      await customerApi.update(customer.id, updateData);
      toast.success('Customer updated successfully');
      
      if (onCustomerUpdate) {
        await onCustomerUpdate();
      }
      
      onClose();
    } catch (err) {
      console.error('Error updating customer:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update customer';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    if (!isUpdating) {
      onClose();
    }
  };

  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">Edit Customer</h2>
          <button
            onClick={handleClose}
            disabled={isUpdating}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Customer Info */}
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Customer ID: {customer.customerId}</p>
                <p className="text-sm text-gray-500">Phone: {customer.phone}</p>
              </div>

          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              disabled={isUpdating}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              disabled={isUpdating}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={isUpdating}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'MALE' | 'FEMALE' | 'OTHER' })}
              disabled={isUpdating}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {GENDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              disabled={isUpdating}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm font-medium text-gray-700">
              Active
            </label>
          </div>

          {/* Government ID */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Government ID
            </label>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={formData.govtIdType}
                onChange={(e) => setFormData({ ...formData, govtIdType: e.target.value as typeof formData.govtIdType })}
                disabled={isUpdating}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select Type</option>
                {GOVT_ID_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={formData.govtIdNumber}
                onChange={(e) => setFormData({ ...formData, govtIdNumber: e.target.value })}
                disabled={isUpdating}
                placeholder="ID Number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Store Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Store Name
            </label>
            <input
              type="text"
              value={formData.storeName}
              onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
              disabled={isUpdating}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Loyalty Tier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loyalty Tier
            </label>
            <select
              value={formData.loyaltyTier}
              onChange={(e) => setFormData({ ...formData, loyaltyTier: e.target.value as 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND' })}
              disabled={isUpdating}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {LOYALTY_TIERS.map((tier) => (
                <option key={tier.value} value={tier.value}>
                  {tier.label}
                </option>
              ))}
            </select>
          </div>

          {/* Loyalty Points */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loyalty Points
            </label>
            <input
              type="number"
              min="0"
              value={formData.loyaltyPoints}
              onChange={(e) => setFormData({ ...formData, loyaltyPoints: parseInt(e.target.value) || 0 })}
              disabled={isUpdating}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password (Optional)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={isUpdating}
                placeholder="Leave empty to keep current password"
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isUpdating}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Only enter a new password if you want to change it. Leave empty to keep the current password.
            </p>
          </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isUpdating || isLoading}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating || isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Updating...' : 'Update Customer'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

