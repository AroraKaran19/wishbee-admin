import { getAuthHeaders } from "@/lib/utils/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://wishbee-web.vercel.app/api";

export type OfflineStoreStatus = "ACTIVE" | "CLOSED";

export interface OfflineConfiguration {
  _id?: string;
  status: OfflineStoreStatus;
  createdAt?: string;
  updatedAt?: string;
}

export const offlineConfigurationsApi = {
  /**
   * SUPER_ADMIN only. Returns singleton `{ status }`.
   */
  get: async (): Promise<{ success: boolean; data: OfflineConfiguration }> => {
    const response = await fetch(`${API_BASE_URL}/offline-configurations`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Failed to load offline configuration: ${response.statusText}`
      );
    }

    return response.json();
  },

  /**
   * SUPER_ADMIN only. Upserts singleton config.
   */
  update: async (
    status: OfflineStoreStatus
  ): Promise<{ success: boolean; data: OfflineConfiguration }> => {
    const response = await fetch(`${API_BASE_URL}/offline-configurations`, {
      method: "PATCH",
      headers: {
        ...(await getAuthHeaders()),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Failed to update offline configuration: ${response.statusText}`
      );
    }

    return response.json();
  },
};
