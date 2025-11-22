import { getAuthHeaders } from '@/lib/utils/auth';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'https://wishbee-web.vercel.app/api';

export type BannerType = "hero" | "offers" | "hero-mob" | "offers-mob" | "authentication";

export interface Banner {
  _id: string;
  imageUrl: string;
  type: BannerType;
  order: number;
  isActive: boolean;
  link?: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBannerData {
  imageUrl: string;
  type: BannerType;
  order?: number;
  isActive?: boolean;
  link?: string;
  title?: string;
}

export interface UpdateBannerData {
  imageUrl?: string;
  type?: BannerType;
  order?: number;
  isActive?: boolean;
  link?: string;
  title?: string;
}

export interface ReorderBannerData {
  id: string;
  order: number;
}

export const bannerApi = {
  // Get all banners (Admin)
  getAll: async (type?: BannerType): Promise<Banner[]> => {
    const searchParams = new URLSearchParams();
    if (type) searchParams.append("type", type);
    
    const url = `${API_BASE_URL}/banners${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch banners: ${response.statusText}`
      );
    }

    const result = await response.json();
    return result.data || [];
  },

  // Get active banners (Public)
  getActive: async (type?: BannerType): Promise<Banner[]> => {
    const searchParams = new URLSearchParams();
    if (type) searchParams.append("type", type);
    
    const url = `${API_BASE_URL}/banners/active${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch active banners: ${response.statusText}`
      );
    }

    const result = await response.json();
    return result.data || [];
  },

  // Get banner by ID
  getById: async (bannerId: string): Promise<Banner> => {
    const response = await fetch(`${API_BASE_URL}/banners/${bannerId}`, {
      method: 'GET',
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch banner: ${response.statusText}`
      );
    }

    const result = await response.json();
    return result.data;
  },

  // Create banner
  create: async (data: CreateBannerData): Promise<Banner> => {
    const response = await fetch(`${API_BASE_URL}/banners`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to create banner: ${response.statusText}`
      );
    }

    const result = await response.json();
    return result.data;
  },

  // Update banner
  update: async (bannerId: string, data: UpdateBannerData): Promise<Banner> => {
    const response = await fetch(`${API_BASE_URL}/banners/${bannerId}`, {
      method: 'PATCH',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to update banner: ${response.statusText}`
      );
    }

    const result = await response.json();
    return result.data;
  },

  // Delete banner
  delete: async (bannerId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/banners/${bannerId}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to delete banner: ${response.statusText}`
      );
    }
  },

  // Reorder banners
  reorder: async (bannerOrders: ReorderBannerData[]): Promise<Banner[]> => {
    const response = await fetch(`${API_BASE_URL}/banners/reorder`, {
      method: 'PATCH',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ bannerOrders }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to reorder banners: ${response.statusText}`
      );
    }

    const result = await response.json();
    return result.data || [];
  },
};

