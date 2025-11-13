const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'https://wishbee-web.vercel.app/api';

export interface Banner {
  _id: string;
  imageUrl: string;
  type: "hero" | "offers";
  order: number;
  isActive: boolean;
  link?: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBannerData {
  imageUrl: string;
  type: "hero" | "offers";
  order?: number;
  isActive?: boolean;
  link?: string;
  title?: string;
}

export interface UpdateBannerData {
  imageUrl?: string;
  type?: "hero" | "offers";
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
  getAll: async (type?: "hero" | "offers"): Promise<Banner[]> => {
    const searchParams = new URLSearchParams();
    if (type) searchParams.append("type", type);
    
    const url = `${API_BASE_URL}/banners${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add Authorization header when auth is implemented
        // 'Authorization': `Bearer ${token}`,
      },
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
  getActive: async (type?: "hero" | "offers"): Promise<Banner[]> => {
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
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add Authorization header when auth is implemented
        // 'Authorization': `Bearer ${token}`,
      },
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
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add Authorization header when auth is implemented
        // 'Authorization': `Bearer ${token}`,
      },
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
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add Authorization header when auth is implemented
        // 'Authorization': `Bearer ${token}`,
      },
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
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add Authorization header when auth is implemented
        // 'Authorization': `Bearer ${token}`,
      },
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
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add Authorization header when auth is implemented
        // 'Authorization': `Bearer ${token}`,
      },
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

