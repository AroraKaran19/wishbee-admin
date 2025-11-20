import { getAuthHeaders } from '@/lib/utils/auth';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'https://wishbee-web.vercel.app/api';

export type PeriodType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | '10years';

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
  // Get most selling page data
  getPage: async (periodType: PeriodType = 'monthly'): Promise<MostSellingPageData> => {
    const params = new URLSearchParams();
    params.append('periodType', periodType);

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
};

