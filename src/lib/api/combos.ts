import { ComboProduct } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Form data type for combo creation (bridges form and API)
export interface ComboFormData {
  name: string;
  description: string;
  images: string[];
  status: "ACTIVE" | "OUT_OF_STOCK" | "DISCONTINUED";
  isOrganic: boolean;
  mrp: number;
  productIds: string[];
  stock: number;
  // Optional fields
  minimumOrderQuantity?: number;
  maximumOrderQuantity?: number;
  alertExpiry?: number;
  expiry?: string; // Form uses string for date input
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  slug?: string;
}

// API data type (matches API documentation exactly)
export interface ComboCreateData {
  name: string;
  description: string;
  images: string[];
  status: "ACTIVE" | "OUT_OF_STOCK" | "DISCONTINUED";
  isOrganic: boolean;
  mrp: number;
  productIds: string[];
  stock: number;
}

export interface ComboUpdateData extends Partial<ComboCreateData> {
  _id: string;
}

export interface ComboListResponse {
  success: boolean;
  data: {
    combos: ComboProduct[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  message: string;
}

export interface ComboResponse {
  success: boolean;
  data: ComboProduct;
  message: string;
}

export const comboApi = {
  // Get all combos with pagination and filters
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    isOrganic?: boolean;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }): Promise<ComboListResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.status) searchParams.append("status", params.status);
    if (params?.isOrganic !== undefined) searchParams.append("isOrganic", params.isOrganic.toString());
    if (params?.minPrice) searchParams.append("minPrice", params.minPrice.toString());
    if (params?.maxPrice) searchParams.append("maxPrice", params.maxPrice.toString());
    if (params?.search) searchParams.append("search", params.search);

    const response = await fetch(`${API_BASE_URL}/combos?${searchParams.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch combos: ${response.statusText}`);
    }

    return response.json();
  },

  // Get combo by ID
  getById: async (id: string): Promise<ComboResponse> => {
    const response = await fetch(`${API_BASE_URL}/combos/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch combo: ${response.statusText}`);
    }

    return response.json();
  },

  // Get combo products
  getProducts: async (id: string): Promise<ComboResponse> => {
    const response = await fetch(`${API_BASE_URL}/combos/${id}/products`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch combo products: ${response.statusText}`);
    }

    return response.json();
  },

  // Get suggested combo deals
  getSuggested: async (productId: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<ComboListResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const response = await fetch(`${API_BASE_URL}/combos/suggested/${productId}?${searchParams.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch suggested combos: ${response.statusText}`);
    }

    return response.json();
  },

  // Validate combo
  validate: async (id: string): Promise<{
    success: boolean;
    data: {
      isValid: boolean;
      availableStock: number;
      errors: string[];
    };
    message: string;
  }> => {
    const response = await fetch(`${API_BASE_URL}/combos/${id}/validate`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to validate combo: ${response.statusText}`);
    }

    return response.json();
  },

  // Get combo stats
  getStats: async (id: string): Promise<{
    success: boolean;
    data: {
      totalViews: number;
      totalPurchases: number;
      conversionRate: number;
    };
    message: string;
  }> => {
    const response = await fetch(`${API_BASE_URL}/combos/${id}/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch combo stats: ${response.statusText}`);
    }

    return response.json();
  },

  // Create combo
  create: async (data: ComboCreateData): Promise<ComboResponse> => {
    const response = await fetch(`${API_BASE_URL}/combos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to create combo: ${response.statusText}`);
    }

    return response.json();
  },

  // Update combo
  update: async (data: ComboUpdateData): Promise<ComboResponse> => {
    const { _id, ...updateData } = data;
    
    const response = await fetch(`${API_BASE_URL}/combos/${_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to update combo: ${response.statusText}`);
    }

    return response.json();
  },

  // Update combo stock
  updateStock: async (id: string, quantity: number): Promise<ComboResponse> => {
    const response = await fetch(`${API_BASE_URL}/combos/${id}/stock`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to update combo stock: ${response.statusText}`);
    }

    return response.json();
  },

  // Delete combo
  delete: async (id: string): Promise<{
    success: boolean;
    data: null;
    message: string;
  }> => {
    const response = await fetch(`${API_BASE_URL}/combos/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to delete combo: ${response.statusText}`);
    }

    return response.json();
  },
};
