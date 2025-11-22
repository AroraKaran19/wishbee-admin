import { getAuthHeaders } from '@/lib/utils/auth';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'https://wishbee-web.vercel.app/api';

export type MostSellingPeriod = '7days' | '30days' | '6months' | '12months' | 'all-time';

export interface ChartDataPoint {
  date: string;
  sales: number;
}

export interface SalePerformance {
  salesAmount: number;
  growthPercentage: number;
  period: string;
  chartData: ChartDataPoint[];
}

export interface TopSellingProduct {
  productId: string;
  productName: string;
  soldQuantity: number;
  revenue: number;
  remainingQuantity: number;
}

export interface LeastSellingProduct {
  productId: string;
  productName: string;
  soldQuantity: number;
  daysSinceLastOrder: number | null;
  currentStock: number;
}

export interface ShortToExpiryProduct {
  productId: string;
  productName: string;
  expiryDate: string;
  daysLeft: number;
  currentStock: number;
}

export interface MostSellingPageData {
  salePerformance: SalePerformance;
  topSellingProducts: TopSellingProduct[];
  leastSellingProducts: LeastSellingProduct[];
  shortToExpiryProducts: ShortToExpiryProduct[];
}

export const mostSellingApi = {
  // Get most selling page data (sale performance and short expiry products only)
  getPage: async (
    period?: MostSellingPeriod,
    startDate?: string,
    endDate?: string
  ): Promise<MostSellingPageData> => {
    const params = new URLSearchParams();
    
    // If custom dates are provided, use them instead of period
    if (startDate && endDate) {
      params.append('startDate', startDate);
      params.append('endDate', endDate);
    } else {
      // Otherwise, use the period (default to '30days' if not provided)
      params.append('period', period || '30days');
    }

    const response = await fetch(`${API_BASE_URL}/most-selling?${params.toString()}`, {
      method: 'GET',
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch most selling page data: ${response.statusText}`
      );
    }

    const result = await response.json();
    return result.data;
  },

  // Get top selling products
  getTopProducts: async (
    period?: MostSellingPeriod,
    startDate?: string,
    endDate?: string,
    limit?: number
  ): Promise<TopSellingProduct[]> => {
    const params = new URLSearchParams();
    
    // If custom dates are provided, use them instead of period
    if (startDate && endDate) {
      params.append('startDate', startDate);
      params.append('endDate', endDate);
    } else {
      // Otherwise, use the period (default to '30days' if not provided)
      params.append('period', period || '30days');
    }

    if (limit) {
      params.append('limit', limit.toString());
    }

    const response = await fetch(`${API_BASE_URL}/most-selling/top-products?${params.toString()}`, {
      method: 'GET',
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch top selling products: ${response.statusText}`
      );
    }

    const result = await response.json();
    return result.data;
  },

  // Get least selling products
  getLeastProducts: async (
    period?: MostSellingPeriod,
    startDate?: string,
    endDate?: string,
    limit?: number,
    maxSoldQuantity?: number
  ): Promise<LeastSellingProduct[]> => {
    const params = new URLSearchParams();
    
    // If custom dates are provided, use them instead of period
    if (startDate && endDate) {
      params.append('startDate', startDate);
      params.append('endDate', endDate);
    } else {
      // Otherwise, use the period (default to '30days' if not provided)
      params.append('period', period || '30days');
    }

    if (limit) {
      params.append('limit', limit.toString());
    }

    if (maxSoldQuantity !== undefined) {
      params.append('maxSoldQuantity', maxSoldQuantity.toString());
    }

    const response = await fetch(`${API_BASE_URL}/most-selling/least-products?${params.toString()}`, {
      method: 'GET',
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch least selling products: ${response.statusText}`
      );
    }

    const result = await response.json();
    return result.data;
  },
};

