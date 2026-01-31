import { getAuthHeaders } from '@/lib/utils/auth';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'https://wishbee-web.vercel.app/api';

export const shippingApi = {
  /**
   * Get current shipping charges (used by cart and payment).
   * Returns 0 if no charges configured.
   */
  getCharges: async (): Promise<{ success: boolean; data: { charges: number }; message?: string }> => {
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
};
