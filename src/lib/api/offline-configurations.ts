import { getAuthHeaders } from "@/lib/utils/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://wishbee-web.vercel.app/api";

export type OfflineStoreStatus = "ACTIVE" | "CLOSED";

export interface Announcement {
  enabled: boolean;
  message: string;
}

export interface OfflineConfiguration {
  _id?: string;
  status: OfflineStoreStatus;
  message: string;
  announcement?: Announcement;
  createdAt?: string;
  updatedAt?: string;
}

export const CLOSURE_MESSAGE_MAX_LENGTH = 300;
export const ANNOUNCEMENT_MESSAGE_MAX_LENGTH = 300;

export const offlineConfigurationsApi = {
  /**
   * SUPER_ADMIN only. Returns singleton `{ status, message }`.
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
   * A non-empty message is required whenever status is CLOSED.
   */
  update: async (
    status: OfflineStoreStatus,
    message = ""
  ): Promise<{ success: boolean; data: OfflineConfiguration }> => {
    const response = await fetch(`${API_BASE_URL}/offline-configurations`, {
      method: "PATCH",
      headers: {
        ...(await getAuthHeaders()),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status, message }),
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

  /**
   * SUPER_ADMIN only. Toggles the storefront announcement strip.
   * Written separately from the store status so neither can clobber the other.
   * A non-empty message is required whenever enabled is true.
   */
  updateAnnouncement: async (
    enabled: boolean,
    message = ""
  ): Promise<{ success: boolean; data: Announcement }> => {
    const response = await fetch(
      `${API_BASE_URL}/offline-configurations/announcement`,
      {
        method: "PATCH",
        headers: {
          ...(await getAuthHeaders()),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled, message }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Failed to update announcement: ${response.statusText}`
      );
    }

    return response.json();
  },
};
