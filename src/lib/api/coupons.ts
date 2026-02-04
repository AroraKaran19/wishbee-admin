import { getAuthHeaders } from '@/lib/utils/auth';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'https://wishbee-web.vercel.app/api';

export type CouponType = 'percentage' | 'fixed';
export type CouponAccessType = 'GENERAL' | 'LIMITED';

export interface Coupon {
  _id: string;
  code: string;
  type: CouponType;
  description: string;
  value: number;
  accessType: CouponAccessType;
  allowedUserIds?: string[];
  applicableProducts?: string[];
  applicableCategories?: string[];
  minimumPurchaseAmount?: number;
  maximumDiscountAmount?: number;
  validFrom: string;
  validUntil: string;
  maxUses?: number;
  currentUses?: number;
  maxUsesPerUser?: number;
  perUserResetHours?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CouponListResponse {
  success: boolean;
  data: {
    coupons: Coupon[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  message?: string;
}

export interface CouponStats {
  totalUses: number;
  remainingUses: number;
  totalDiscountGiven: number;
  conversionRate: number;
}

export interface CreateCouponData {
  code: string;
  type: CouponType;
  description: string;
  value: number;
  validFrom: string;
  validUntil: string;
  accessType?: CouponAccessType;
  allowedUserIds?: string[];
  applicableProducts?: string[];
  applicableCategories?: string[];
  minimumPurchaseAmount?: number;
  maximumDiscountAmount?: number;
  maxUses?: number;
  maxUsesPerUser?: number;
  perUserResetHours?: number;
  isActive?: boolean;
}

export interface UpdateCouponData extends Partial<CreateCouponData> {}

export const couponApi = {
  /** Get all coupons (Admin) with pagination and filters */
  getAll: async (params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
    type?: string;
    search?: string;
    validOnly?: boolean;
  }): Promise<CouponListResponse['data']> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());
    if (params?.type) searchParams.append('type', params.type);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.validOnly !== undefined) searchParams.append('validOnly', params.validOnly.toString());

    const url = `${API_BASE_URL}/coupons${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch coupons: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  },

  /** Get coupon by ID (Admin) */
  getById: async (id: string): Promise<Coupon> => {
    const response = await fetch(`${API_BASE_URL}/coupons/${id}`, {
      method: 'GET',
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch coupon: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  },

  /** Get coupon stats (Admin) */
  getStats: async (id: string): Promise<CouponStats> => {
    const response = await fetch(`${API_BASE_URL}/coupons/${id}/stats`, {
      method: 'GET',
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch coupon stats: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  },

  /** Create coupon (Admin) */
  create: async (data: CreateCouponData): Promise<Coupon> => {
    // Ensure applicableProducts/applicableCategories are always sent (array) for backend to persist correctly
    const body: Record<string, unknown> = { ...data };
    if (body.applicableProducts === undefined) body.applicableProducts = [];
    if (body.applicableCategories === undefined) body.applicableCategories = [];
    const response = await fetch(`${API_BASE_URL}/coupons`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create coupon: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  },

  /** Update coupon (Admin) */
  update: async (id: string, data: UpdateCouponData): Promise<Coupon> => {
    // Ensure applicableProducts/applicableCategories are always sent so backend persists/clears restrictions
    const body: Record<string, unknown> = { ...data };
    if (body.applicableProducts === undefined) body.applicableProducts = [];
    if (body.applicableCategories === undefined) body.applicableCategories = [];
    const response = await fetch(`${API_BASE_URL}/coupons/${id}`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update coupon: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  },

  /** Delete coupon (Admin) */
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/coupons/${id}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete coupon: ${response.statusText}`);
    }
  },
};
