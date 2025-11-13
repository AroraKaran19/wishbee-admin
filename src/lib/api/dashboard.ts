const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'https://wishbee-web.vercel.app/api';

export const dashboardApi = {
  // Get Inventory
  getInventory: async (params?: {
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const response = await fetch(
      `${API_BASE_URL}/dashboard/inventory?${searchParams}`,
      {
        headers: {
          // TODO: Add Authorization header when auth is implemented
          // 'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  },

  // Get Low Stock Products
  getLowStock: async (params?: {
    threshold?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.threshold) searchParams.append("threshold", params.threshold.toString());

    const response = await fetch(
      `${API_BASE_URL}/dashboard/low-stock?${searchParams}`,
      {
        headers: {
          // TODO: Add Authorization header when auth is implemented
          // 'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  },

  // Get Top Selling Products
  getTopSelling: async (params?: {
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const response = await fetch(
      `${API_BASE_URL}/dashboard/top-selling?${searchParams}`,
      {
        headers: {
          // TODO: Add Authorization header when auth is implemented
          // 'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  },

  // Get Dashboard Statistics (Complete Dashboard Data)
  getStatistics: async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard/statistics`, {
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
        errorData.message || `Failed to fetch dashboard statistics: ${response.statusText}`
      );
    }

    const result = await response.json();
    return result.data;
  },
};

