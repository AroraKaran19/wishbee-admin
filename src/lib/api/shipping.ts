import { getAuthHeaders } from '@/lib/utils/auth';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'https://wishbee-web.vercel.app/api';

export interface MiniBasketTier {
  below: number;
  fee: number;
}

export interface DeliveryFeeConfig {
  charges: number;
  miniBasketTiers: MiniBasketTier[];
  heavyLiftGroups: { _id: string; name: string; fee: number }[];
}

export const shippingApi = {
  /**
   * Get delivery charge, Mini Basket tiers and Heavy Lift group fees.
   */
  getCharges: async (): Promise<{ success: boolean; data: DeliveryFeeConfig; message?: string }> => {
    const response = await fetch(`${API_BASE_URL}/shipping-charges`, {
      method: 'GET',
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch shipping charges: ${response.statusText}`
      );
    }

    return response.json();
  },

  /**
   * Update shipping charges (Admin only).
   * @param charges - Non-negative number (delivery charge amount)
   */
  updateCharges: async (
    charges: number
  ): Promise<{ success: boolean; data: { charges: number }; message?: string }> => {
    if (charges < 0) {
      throw new Error('Shipping charges must be a non-negative number');
    }

    const response = await fetch(`${API_BASE_URL}/shipping-charges`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ charges }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to update shipping charges: ${response.statusText}`
      );
    }

    return response.json();
  },

  updateMiniBasketTiers: async (
    miniBasketTiers: MiniBasketTier[]
  ): Promise<{ success: boolean; data: DeliveryFeeConfig; message?: string }> => {
    const response = await fetch(`${API_BASE_URL}/shipping-charges`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ miniBasketTiers }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to update Mini Basket tiers: ${response.statusText}`
      );
    }

    return response.json();
  },
};
