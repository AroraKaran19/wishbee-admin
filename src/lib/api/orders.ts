import { Order, OrderSummary } from "@/lib/types";

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

export interface OrderFilters {
  status?: string;
  userId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
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

    const response = await fetch(
      `${API_BASE_URL}/orders/all?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  },

  // Get order analytics
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
        headers: {
          "Content-Type": "application/json",
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`,
        },
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

  // Get order by ID
  getById: async (orderId: string): Promise<Order> => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Add authorization header if needed
        // 'Authorization': `Bearer ${token}`,
      },
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
    notes?: string
  ): Promise<Order> => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        // Add authorization header if needed
        // 'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status, notes }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update order status: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  },

  // Cancel order
  cancel: async (orderId: string, reason: string): Promise<Order> => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        // Add authorization header if needed
        // 'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      throw new Error(`Failed to cancel order: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  },
};

// Helper function to convert API order to UI order format
export const convertApiOrderToUIOrder = (apiOrder: any): Order => {
  return {
    id: apiOrder._id,
    orderId: apiOrder.refId,
    amount: apiOrder.totalAmount,
    customer: apiOrder.user?.phoneNumber || "Unknown",
    status:
      apiOrder.status === "DELIVERED"
        ? "Delivered"
        : apiOrder.status === "CANCELLED"
        ? "Cancelled"
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
        productName: `Product ${item.product}`, // Since product is just an ID, we'll show a generic name
        quantity: item.quantity,
        price: item.priceAtPurchase,
      })) || [],
    address: {
      street: apiOrder.shippingAddress?.addressLine || "",
      city: apiOrder.shippingAddress?.city || "",
      state: apiOrder.shippingAddress?.state || "",
      pincode: apiOrder.shippingAddress?.postalCode || "",
    },
    trackingNumber: apiOrder.trackingNumber,
  };
};

// Helper function to convert order analytics to order summary
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
  const onTheWayCost = onTheWay > 0 ? (analytics.totalRevenue * onTheWay) / analytics.totalOrders : 0;
  const deliveredCost = delivered > 0 ? (analytics.totalRevenue * delivered) / analytics.totalOrders : 0;

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
