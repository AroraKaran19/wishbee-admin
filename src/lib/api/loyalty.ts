import { getAuthHeaders } from "@/lib/utils/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://wishbee-web.vercel.app/api";

export type LoyaltyTierName =
  | "BRONZE"
  | "SILVER"
  | "GOLD"
  | "PLATINUM"
  | "DIAMOND";

export interface LoyaltyTierThreshold {
  amount: number;
  tier: LoyaltyTierName;
  /**
   * Optional default discount percentage applied for this tier.
   * Interpretation (e.g. cart discount) is handled on the backend.
   */
  discountPercentage?: number;
}

export interface LoyaltyTierConfigResponse {
  success: boolean;
  data: {
    thresholds: LoyaltyTierThreshold[];
  };
  message?: string;
}

export const loyaltyApi = {
  /**
   * Get current loyalty tier thresholds.
   * Mirrors `GET /api/loyalty-tier-config` from API documentation.
   */
  getConfig: async (): Promise<LoyaltyTierConfigResponse> => {
    const response = await fetch(`${API_BASE_URL}/loyalty-tier-config`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Failed to fetch loyalty tier config: ${response.statusText}`
      );
    }

    return response.json();
  },

  /**
   * Update loyalty tier thresholds (Admin).
   * Mirrors `PATCH /api/loyalty-tier-config` from API documentation.
   */
  updateConfig: async (
    thresholds: LoyaltyTierThreshold[]
  ): Promise<LoyaltyTierConfigResponse> => {
    if (!Array.isArray(thresholds) || thresholds.length === 0) {
      throw new Error("At least one loyalty tier threshold is required");
    }

    const normalized = thresholds.map((t) => {
      const amount = Number(t.amount) || 0;
      const base: any = {
        amount,
        tier: t.tier,
      };

      if (typeof t.discountPercentage === "number") {
        base.discountPercentage = t.discountPercentage;
      }

      return base;
    });

    const response = await fetch(`${API_BASE_URL}/loyalty-tier-config`, {
      method: "PATCH",
      headers: await getAuthHeaders(),
      body: JSON.stringify({ thresholds: normalized }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Failed to update loyalty tier config: ${response.statusText}`
      );
    }

    return response.json();
  },
};

