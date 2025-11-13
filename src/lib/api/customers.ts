import { Customer } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface CustomerFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string; // Filter by user role (default: "CUSTOMER")
  isActive?: boolean; // Filter by active status
  sortBy?: string; // Field to sort by (default: "createdAt")
  sortOrder?: "asc" | "desc"; // Sort order (default: "desc")
}

export interface CustomerResponse {
  users: any[]; // Raw API users
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const customerApi = {
  // Get all customers (Admin)
  getAll: async (filters: CustomerFilters = {}): Promise<CustomerResponse> => {
    const params = new URLSearchParams();

    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.search) params.append("search", filters.search);
    if (filters.role) params.append("role", filters.role);
    if (filters.isActive !== undefined) params.append("isActive", filters.isActive.toString());
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

    const response = await fetch(
      `${API_BASE_URL}/users/all?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // TODO: Add Authorization header when auth is implemented
          // 'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch customers: ${response.statusText}`
      );
    }

    const result = await response.json();
    return result.data;
  },

  // Get customer by ID (Admin) - returns raw API user data
  getById: async (userId: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // TODO: Add Authorization header when auth is implemented
        // 'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch customer: ${response.statusText}`
      );
    }

    const result = await response.json();
    return result.data;
  },

  // Get customer by ID and convert to UI format
  getByIdAsCustomer: async (userId: string): Promise<Customer> => {
    const apiUser = await customerApi.getById(userId);
    return convertApiCustomerToUICustomer(apiUser);
  },

  // Update customer (Admin)
  update: async (userId: string, data: {
    firstName?: string;
    lastName?: string;
    photo?: string;
    email?: string;
    gender?: "MALE" | "FEMALE" | "OTHER";
    isActive?: boolean;
    gstNumber?: string;
    storeName?: string;
    loyaltyTier?: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND";
    loyaltyPoints?: number;
    password?: string;
  }): Promise<Customer> => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        // TODO: Add Authorization header when auth is implemented
        // 'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to update customer: ${response.statusText}`
      );
    }

    const result = await response.json();
    return convertApiCustomerToUICustomer(result.data);
  },

  // Delete customer
  delete: async (customerId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/user/${customerId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        // TODO: Add Authorization header when auth is implemented
        // 'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to delete customer: ${response.statusText}`
      );
    }
  },
};

// Helper function to convert API customer to UI customer format
export const convertApiCustomerToUICustomer = (apiUser: any): Customer => {
  // Calculate total spend from orders (if available)
  const totalSpend = apiUser.totalSpend || apiUser.totalRevenue || 0;
  
  // Calculate total orders from orders array length
  const totalOrders = apiUser.orders?.length || apiUser.totalOrders || apiUser.ordersCount || 0;
  
  // Calculate average order value
  const averageOrderValue = totalOrders > 0 ? totalSpend / totalOrders : 0;
  
  // Map loyalty tier from API (BRONZE, SILVER, GOLD, PLATINUM) to UI format
  const mapLoyaltyTier = (tier?: string): "Bronze" | "Silver" | "Gold" | "Platinum" => {
    if (!tier) {
      // Fallback: Determine loyalty tier based on total spend if not provided
      if (totalSpend >= 50000) return "Platinum";
      if (totalSpend >= 25000) return "Gold";
      if (totalSpend >= 10000) return "Silver";
      return "Bronze";
    }
    // Map API tier to UI format
    const tierMap: Record<string, "Bronze" | "Silver" | "Gold" | "Platinum"> = {
      "BRONZE": "Bronze",
      "SILVER": "Silver",
      "GOLD": "Gold",
      "PLATINUM": "Platinum",
    };
    return tierMap[tier.toUpperCase()] || "Bronze";
  };

  // Format last order date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Get status
  const getStatus = (isActive?: boolean): "Active" | "Inactive" | "Suspended" => {
    if (isActive === false) return "Inactive";
    // You might want to add a suspended field check here
    return "Active";
  };

  // Get customer name
  const getName = (user: any): string => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) return user.firstName;
    if (user.name) return user.name;
    return user.phoneNumber || "Unknown";
  };

  // Get email
  const getEmail = (user: any): string => {
    return user.email || "N/A";
  };

  // Get customer ID (use _id or phoneNumber)
  const getCustomerId = (user: any): string => {
    return user.customerId || user.refId || user._id || user.phoneNumber || "N/A";
  };

  // Get last order date from orders array (would need to fetch order details)
  // For now, we'll use a placeholder or try to get from user data
  const getLastOrderDate = (user: any): string | undefined => {
    return user.lastOrderDate || user.lastOrder || undefined;
  };

  return {
    id: apiUser._id,
    name: getName(apiUser),
    phone: apiUser.phoneNumber || "N/A",
    email: getEmail(apiUser),
    customerId: getCustomerId(apiUser),
    totalSpend: totalSpend,
    loyaltyTier: mapLoyaltyTier(apiUser.loyaltyTier),
    lastOrder: formatDate(getLastOrderDate(apiUser)),
    status: getStatus(apiUser.isActive),
    registrationDate: formatDate(apiUser.createdAt),
    totalOrders: totalOrders,
    averageOrderValue: averageOrderValue,
    preferredCategories: apiUser.preferredCategories || [],
    address: apiUser.addresses && apiUser.addresses.length > 0 ? {
      street: apiUser.addresses[0].addressLine || "",
      city: apiUser.addresses[0].city || "",
      state: apiUser.addresses[0].state || "",
      pincode: apiUser.addresses[0].postalCode || "",
    } : undefined,
  };
};

