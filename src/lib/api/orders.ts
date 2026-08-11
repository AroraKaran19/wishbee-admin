import { Order, OrderSummary } from "@/lib/types";
import { getAuthHeaders } from "@/lib/utils/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface OrderAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: {
    PENDING: number;
    PROCESSING?: number;
    SHIPPED?: number;
    DELIVERED?: number;
    CANCELLED?: number;
  };
  revenueByMonth?: Array<{
    month: string;
    revenue: number;
  }>;
  topProducts?: Array<{
    product: string;
    quantity: number;
    revenue: number;
  }>;
}

export type OrderPeriod = 'today' | 'currentDate' | '7days' | '30days' | 'lastMonth' | '6months' | '12months' | 'all-time';

export type TrendGranularity = 'hour' | 'day' | 'month';

export interface OrderTrendPoint {
  /** ISO hour (YYYY-MM-DDTHH), day (YYYY-MM-DD), or month (YYYY-MM). */
  date: string;
  orders: number;
  revenue: number;
}

export interface OrderTrend {
  granularity: TrendGranularity;
  points: OrderTrendPoint[];
}

export interface StatusActivityRow {
  /** Null for changes recorded before actor tracking shipped. */
  userId: string | null;
  name: string;
  role: 'USER' | 'ADMIN' | 'SYSTEM';
  /** Number of changes into each status, keyed by status name. */
  counts: Record<string, number>;
  total: number;
}

export interface StatusActivityResponse {
  rows: StatusActivityRow[];
  totals: Record<string, number>;
  /** Order value moved into each status, keyed by status name. */
  amounts: Record<string, number>;
  period: string;
}

export interface OrderComparison {
  totalOrders: number;
  revenue: number;
  /** Null when the previous window had nothing to compare against. */
  ordersGrowth: number | null;
  revenueGrowth: number | null;
}

export interface OrderFilters {
  status?: string;
  userId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  period?: OrderPeriod;
  startDate?: string;
  endDate?: string;
}

export interface OrderResponse {
  orders: any[]; // Raw API orders
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface OrderAnalyticsResponse {
  data: OrderAnalytics;
  message: string;
}

export interface CashierPosOrdersFilters {
  cashierId: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export interface CashierPosOrdersResponse {
  orders: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PosOrdersFilters {
  cashierId?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export interface PosOrdersResponse {
  orders: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const orderApi = {
  // Get all orders (Admin)
  getAll: async (filters: OrderFilters = {}): Promise<OrderResponse> => {
    const params = new URLSearchParams();

    if (filters.status) params.append("status", filters.status);
    if (filters.userId) params.append("userId", filters.userId);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);
    if (filters.search) params.append("search", filters.search);

    // If custom dates are provided, use them instead of period
    if (filters.startDate && filters.endDate) {
      params.append("startDate", filters.startDate);
      params.append("endDate", filters.endDate);
    } else if (filters.period) {
      params.append("period", filters.period);
    }

    const response = await fetch(
      `${API_BASE_URL}/orders/all?${params.toString()}`,
      {
        method: "GET",
        headers: await getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  },

  // Get order analytics (deprecated - use getStats instead)
  getAnalytics: async (
    filters: { startDate?: string; endDate?: string; status?: string } = {}
  ): Promise<OrderAnalytics> => {
    const params = new URLSearchParams();

    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.status) params.append("status", filters.status);

    const response = await fetch(
      `${API_BASE_URL}/orders/analytics?${params.toString()}`,
      {
        method: "GET",
        headers: await getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch order analytics: ${response.statusText}`
      );
    }

    const result = await response.json();
    return result.data;
  },

  // Who changed order statuses, and to what, within a period
  getStatusActivity: async (filters?: {
    period?: OrderPeriod;
    startDate?: string;
    endDate?: string;
  }): Promise<StatusActivityResponse> => {
    const params = new URLSearchParams();

    if (filters?.startDate && filters?.endDate) {
      params.append("startDate", filters.startDate);
      params.append("endDate", filters.endDate);
    } else if (filters?.period) {
      params.append("period", filters.period);
    }

    const url = `${API_BASE_URL}/orders/status-activity${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    const response = await fetch(url, {
      method: "GET",
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Failed to fetch status activity: ${response.statusText}`
      );
    }

    const result = await response.json();
    return result.data;
  },

  // Get order statistics (Dashboard)
  getStats: async (filters?: {
    period?: "today" | "currentDate" | "7days" | "30days" | "lastMonth" | "6months" | "12months" | "all-time";
    startDate?: string;
    endDate?: string;
  }): Promise<{
    totalOrders: number;
    totalReceived: { count: number; revenue: number };
    totalReturned: { count: number; revenue: number };
    onTheWay: { count: number; cost: number };
    totalCancelled: number;
    totalDelivered: number;
    totalPending: number;
    totalUPIOrders: number;
    totalCODOrders: number;
    totalCardOrders: number;
    period: string;
    trend?: OrderTrend;
    comparison?: OrderComparison;
  }> => {
    const params = new URLSearchParams();

    // If custom dates are provided, use them instead of period
    if (filters?.startDate && filters?.endDate) {
      params.append("startDate", filters.startDate);
      params.append("endDate", filters.endDate);
    } else if (filters?.period) {
      params.append("period", filters.period);
    }
    // If no filters provided, API will use default "7days"

    const url = `${API_BASE_URL}/orders/stats${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await fetch(url, {
      method: "GET",
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Failed to fetch order stats: ${response.statusText}`
      );
    }

    const result = await response.json();
    return result.data;
  },

  // Get order by ID
  getById: async (orderId: string): Promise<Order> => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch order: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  },

  // Update order status
  updateStatus: async (
    orderId: string,
    status: string,
    notes?: string,
    payment?: {
      method?: string;
      status?: string;
      transactionId?: string;
    }
  ): Promise<Order> => {
    const body: any = { status };
    if (notes !== undefined) {
      body.notes = notes;
    }
    if (payment !== undefined) {
      body.payment = payment;
    }

    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: "PATCH",
      headers: await getAuthHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(
        errorData.error?.message ||
          errorData.message ||
          `Failed to update order status: ${response.statusText}`
      );
      (error as any).error = errorData.error || errorData;
      throw error;
    }

    const result = await response.json();
    return result.data;
  },

  // Cancel order
  cancel: async (orderId: string, reason: string): Promise<Order> => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
      method: "PATCH",
      headers: await getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      throw new Error(`Failed to cancel order: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  },

  // Delete order
  delete: async (orderId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: "DELETE",
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to delete order: ${response.statusText}`
      );
    }
  },

  // Get POS orders created by a specific cashier (for summaries)
  getCashierPosOrders: async (
    filters: CashierPosOrdersFilters
  ): Promise<CashierPosOrdersResponse> => {
    const params = new URLSearchParams();

    params.append("cashierId", filters.cashierId);
    if (filters.fromDate) params.append("fromDate", filters.fromDate);
    if (filters.toDate) params.append("toDate", filters.toDate);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    const response = await fetch(
      `${API_BASE_URL}/orders/pos/cashier-orders?${params.toString()}`,
      {
        method: "GET",
        headers: await getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Failed to fetch cashier POS orders: ${response.statusText}`
      );
    }

    const result = await response.json();
    const data = result.data || {};

    return {
      orders: data.orders || [],
      pagination: data.pagination || {
        page: filters.page ?? 1,
        limit: filters.limit ?? (data.orders ? data.orders.length : 0),
        total: data.pagination?.total ?? (data.orders ? data.orders.length : 0),
        pages: data.pagination?.pages ?? 1,
      },
    };
  },

  // Get all POS orders (for bulk invoice)
  getPosOrders: async (
    filters: PosOrdersFilters = {}
  ): Promise<PosOrdersResponse> => {
    const params = new URLSearchParams();

    if (filters.cashierId) params.append("cashierId", filters.cashierId);
    if (filters.fromDate) params.append("fromDate", filters.fromDate);
    if (filters.toDate) params.append("toDate", filters.toDate);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    const response = await fetch(
      `${API_BASE_URL}/orders/pos/orders?${params.toString()}`,
      {
        method: "GET",
        headers: await getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Failed to fetch POS orders: ${response.statusText}`
      );
    }

    const result = await response.json();
    const data = result.data || {};

    return {
      orders: data.orders || [],
      pagination: data.pagination || {
        page: filters.page ?? 1,
        limit: filters.limit ?? (data.orders ? data.orders.length : 0),
        total: data.pagination?.total ?? (data.orders ? data.orders.length : 0),
        pages: data.pagination?.pages ?? 1,
      },
    };
  },

};

/**
 * POS orders: `createdByCashier` may be a string snapshot (survives deleted cashier)
 * or a populated user object from the API.
 */
export function cashierNameFromCreatedBy(createdByCashier: unknown): string | undefined {
  if (createdByCashier == null) return undefined;
  if (typeof createdByCashier === "string") {
    const t = createdByCashier.trim();
    return t || undefined;
  }
  if (typeof createdByCashier === "object") {
    const o = createdByCashier as {
      firstName?: string;
      lastName?: string;
      email?: string;
    };
    const name = [o.firstName, o.lastName].filter(Boolean).join(" ").trim();
    if (name) return name;
    if (o.email?.trim()) return o.email.trim();
  }
  return undefined;
}

// Helper function to convert API order to UI order format
export const convertApiOrderToUIOrder = (apiOrder: any): Order => {
  return {
    id: apiOrder._id,
    orderId: apiOrder.refId,
    amount: apiOrder.totalAmount,
    customer: apiOrder.user?.phoneNumber || apiOrder.user?.name || "Unknown",
    customerFirstName: apiOrder.user?.firstName,
    customerLastName: apiOrder.user?.lastName,
    customerStoreName: apiOrder.storeName ?? apiOrder.user?.storeName,
    walkinCustomerName: apiOrder.walkinCustomerName?.trim() || undefined,
    status:
      apiOrder.status === "DELIVERED"
        ? "Delivered"
        : apiOrder.status === "CANCELLED"
        ? "Cancelled"
        : apiOrder.status === "REFUNDED"
        ? "Refunded"
        : apiOrder.status === "PROCESSING"
        ? "Processing"
        : apiOrder.status === "SHIPPED"
        ? "Shipped"
        : apiOrder.status === "RETURNED"
        ? "Returned"
        : "Pending",
    payment:
      apiOrder.payment?.method === "CARD"
        ? "Card"
        : apiOrder.payment?.method === "UPI"
        ? "UPI"
        : apiOrder.payment?.method === "COD"
        ? "COD"
        : "Net Banking",
    deliveryDate: apiOrder.deliverySlot?.date || new Date().toISOString(),
    orderDate: apiOrder.createdAt || new Date().toISOString(),
    items:
      apiOrder.items?.map((item: any) => ({
        productName: item.product?.name || `Product ${item.product}`,
        title2: item.product?.title2,
        title3: item.product?.title3,
        title4: item.product?.title4,
        productId:
          typeof item.product === "string" ? item.product : item.product?._id,
        productType: item.productType,
        quantity: item.quantity,
        price: item.priceAtPurchase,
        discountApplied: item.discountApplied,
      })) || [],
    address: {
      street: apiOrder.shippingAddress?.addressLine || "",
      city: apiOrder.shippingAddress?.city || "",
      state: apiOrder.shippingAddress?.state || "",
      pincode: apiOrder.shippingAddress?.postalCode || "",
      landmark: apiOrder.shippingAddress?.landmark,
      country: apiOrder.shippingAddress?.country,
      type: apiOrder.shippingAddress?.type,
      latitude: apiOrder.shippingAddress?.latitude,
      longitude: apiOrder.shippingAddress?.longitude,
    },
    billingAddress: apiOrder.billingAddress
      ? {
          street: apiOrder.billingAddress?.addressLine || "",
          city: apiOrder.billingAddress?.city || "",
          state: apiOrder.billingAddress?.state || "",
          pincode: apiOrder.billingAddress?.postalCode || "",
          landmark: apiOrder.billingAddress?.landmark,
          country: apiOrder.billingAddress?.country,
          type: apiOrder.billingAddress?.type,
          latitude: apiOrder.billingAddress?.latitude,
          longitude: apiOrder.billingAddress?.longitude,
        }
      : undefined,
    trackingNumber: apiOrder.trackingNumber,
    orderNotes: apiOrder.orderNotes,
    updateHistory: apiOrder.updateHistory?.map((history: any) => ({
      status: history.status,
      updatedAt: history.updatedAt,
      updatedBy: history.updatedBy,
      updatedByName: history.updatedByName,
      updatedByUser: history.updatedByUser,
      reason: history.reason,
      notes: history.notes,
    })),
    paymentDetails: apiOrder.payment
      ? {
          method: apiOrder.payment.method,
          transactionId: apiOrder.payment.transactionId,
          status: apiOrder.payment.status,
          amount: apiOrder.payment.amount,
        }
      : undefined,
    deliverySlot: apiOrder.deliverySlot
      ? {
          date:
            typeof apiOrder.deliverySlot.date === "string"
              ? apiOrder.deliverySlot.date
              : apiOrder.deliverySlot.date?.toISOString() ||
                new Date().toISOString(),
          timeWindow: apiOrder.deliverySlot.timeWindow,
        }
      : undefined,
    itemsTotal: apiOrder.itemsTotal,
    shippingCharges: apiOrder.shippingCharges,
    couponDiscount: apiOrder.couponDiscount,
    couponCode: apiOrder.couponCode,
    loyaltyDiscountPercent: apiOrder.loyaltyDiscountPercent,
    loyaltyDiscountAmount: apiOrder.loyaltyDiscountAmount,
    walkin: apiOrder.walkin === true,
    cashierName: cashierNameFromCreatedBy(apiOrder.createdByCashier),
    createdAt: apiOrder.createdAt,
    updatedAt: apiOrder.updatedAt,
  };
};

// Helper function to convert order analytics to order summary (deprecated)
export const convertAnalyticsToOrderSummary = (
  analytics: OrderAnalytics
): OrderSummary => {
  // Calculate values from available data
  const delivered = analytics.ordersByStatus.DELIVERED || 0;
  const shipped = analytics.ordersByStatus.SHIPPED || 0;
  const processing = analytics.ordersByStatus.PROCESSING || 0;
  const onTheWay = shipped + processing;

  // Since we don't have revenueByStatus, we'll estimate based on total revenue
  // This is a simplified calculation - in a real app, you'd want more detailed data
  const onTheWayCost =
    onTheWay > 0
      ? (analytics.totalRevenue * onTheWay) / analytics.totalOrders
      : 0;
  const deliveredCost =
    delivered > 0
      ? (analytics.totalRevenue * delivered) / analytics.totalOrders
      : 0;

  return {
    totalOrders: analytics.totalOrders,
    totalReceived: delivered,
    totalReturned: 0, // This would need to be calculated from return data
    onTheWay: onTheWay,
    revenue: analytics.totalRevenue,
    returnAmount: 0, // This would need to be calculated from return data
    onTheWayCost: onTheWayCost,
    trends: {
      totalOrders: { value: analytics.totalOrders, percentage: 0 },
      totalReceived: {
        value: delivered,
        percentage: 0,
      },
      totalReturned: { value: 0, percentage: 0 },
      onTheWay: {
        value: onTheWay,
        percentage: 0,
      },
    },
  };
};

// Helper function to convert order stats to order summary
export const convertStatsToOrderSummary = (stats: {
  totalOrders: number;
  totalReceived: { count: number; revenue: number };
  totalReturned: { count: number; revenue: number };
  onTheWay: { count: number; cost: number };
  totalCancelled?: number;
  totalDelivered?: number;
  totalPending?: number;
  totalUPIOrders?: number;
  totalCODOrders?: number;
  totalCardOrders?: number;
  period: string;
  trend?: OrderTrend;
  comparison?: OrderComparison;
}): OrderSummary => {
  return {
    totalOrders: stats.totalOrders,
    totalReceived: stats.totalReceived.count,
    totalReturned: stats.totalReturned.count,
    onTheWay: stats.onTheWay.count,
    revenue: stats.totalReceived.revenue,
    returnAmount: stats.totalReturned.revenue,
    onTheWayCost: stats.onTheWay.cost,
    totalCancelled: stats.totalCancelled,
    totalDelivered: stats.totalDelivered,
    totalPending: stats.totalPending,
    totalUPIOrders: stats.totalUPIOrders,
    totalCODOrders: stats.totalCODOrders,
    totalCardOrders: stats.totalCardOrders,
    period: stats.period,
    trend: stats.trend,
    comparison: stats.comparison,
    trends: {
      totalOrders: { value: stats.totalOrders, percentage: 0 },
      totalReceived: {
        value: stats.totalReceived.count,
        percentage: 0,
      },
      totalReturned: { value: stats.totalReturned.count, percentage: 0 },
      onTheWay: {
        value: stats.onTheWay.count,
        percentage: 0,
      },
    },
  };
};
