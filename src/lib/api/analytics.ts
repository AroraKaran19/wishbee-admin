import { getAuthHeaders } from '@/lib/utils/auth';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'https://wishbee-web.vercel.app/api';

export type AnalyticsPeriod = '7days' | '30days' | '6months' | '12months' | 'all-time';

export interface KeyMetric {
  count?: number;
  amount?: number;
  growthPercentage: number;
  periodLabel: string;
}

export interface ProfitRevenueTrend {
  date: string;
  revenue: number;
  profit: number;
}

export interface ProfitRevenueChart {
  trend: ProfitRevenueTrend[];
  totalRevenue: number;
  totalProfit: number;
  revenueGrowth: number;
  profitGrowth: number;
  periodLabel: string;
}

export interface SalesByCategory {
  categoryId?: string;
  categoryName: string;
  totalSales: number;
  percentage: number;
}

export interface AnalyticsPageData {
  keyMetrics: {
    totalOrders: KeyMetric;
    totalRevenue: KeyMetric;
    newCustomers: KeyMetric;
  };
  profitAndRevenueChart: ProfitRevenueChart;
  salesByCategory: SalesByCategory[];
  summary: {
    totalOrders: {
      count: number;
      growthPercentage: number;
    };
    totalRevenue: {
      amount: number;
      growthPercentage: number;
    };
    newCustomers: {
      count: number;
      growthPercentage: number;
    };
  };
  period: string;
}

export interface NewCustomersData {
  count: number;
  period: string;
  growth: number;
}

export interface TotalRevenueData {
  totalRevenue: number;
  monthlyRevenue: number;
  growth: number;
}

export interface TotalOrdersData {
  totalOrders: number;
  monthlyOrders: number;
  growth: number;
}

export interface AnalyticsDashboardData {
  newCustomers: {
    count: number;
    growth: number;
  };
  totalRevenue: {
    amount: number;
    growth: number;
  };
  totalOrders: {
    count: number;
    growth: number;
  };
  salesByCategory: SalesByCategory[];
}

export const analyticsApi = {
  // Get analytics page data (comprehensive)
  getPage: async (period: AnalyticsPeriod = '30days'): Promise<AnalyticsPageData> => {
    const params = new URLSearchParams();
    params.append('period', period);

    const response = await fetch(`${API_BASE_URL}/analytics/page?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch analytics page data: ${response.statusText}`
      );
    }

    const result = await response.json();
    return result.data;
  },

  // Get new customers
  getNewCustomers: async (
    period: AnalyticsPeriod = '30days',
    startDate?: string,
    endDate?: string
  ): Promise<NewCustomersData> => {
    const params = new URLSearchParams();
    params.append('period', period);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await fetch(`${API_BASE_URL}/analytics/new-customers?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch new customers: ${response.statusText}`
      );
    }

    const result = await response.json();
    return result.data;
  },

  // Get total revenue
  getTotalRevenue: async (period: AnalyticsPeriod = '30days'): Promise<TotalRevenueData> => {
    const params = new URLSearchParams();
    params.append('period', period);

    const response = await fetch(`${API_BASE_URL}/analytics/total-revenue?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch total revenue: ${response.statusText}`
      );
    }

    const result = await response.json();
    return result.data;
  },

  // Get total orders
  getTotalOrders: async (period: AnalyticsPeriod = '30days'): Promise<TotalOrdersData> => {
    const params = new URLSearchParams();
    params.append('period', period);

    const response = await fetch(`${API_BASE_URL}/analytics/total-orders?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch total orders: ${response.statusText}`
      );
    }

    const result = await response.json();
    return result.data;
  },

  // Get sales by category
  getSalesByCategory: async (
    period: AnalyticsPeriod = '30days',
    limit: number = 10
  ): Promise<SalesByCategory[]> => {
    const params = new URLSearchParams();
    params.append('period', period);
    params.append('limit', limit.toString());

    const response = await fetch(
      `${API_BASE_URL}/analytics/sales-by-category?${params.toString()}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch sales by category: ${response.statusText}`
      );
    }

    const result = await response.json();
    return result.data;
  },

  // Get analytics dashboard
  getDashboard: async (period: AnalyticsPeriod = '30days'): Promise<AnalyticsDashboardData> => {
    const params = new URLSearchParams();
    params.append('period', period);

    const response = await fetch(`${API_BASE_URL}/analytics/dashboard?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch analytics dashboard: ${response.statusText}`
      );
    }

    const result = await response.json();
    return result.data;
  },
};

