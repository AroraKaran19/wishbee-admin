const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api";

// Get presigned URL for S3 upload
export const getPresignedUrl = async (fileName: string, fileType: string) => {
  const response = await fetch(`${API_BASE_URL}/presigned-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileName,
      fileType,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }

  return response.json();
};

export const productApi = {
  // Create Product
  create: async (data: {
    sku: string;
    name: string;
    description: string;
    highlights: string[];
    categoryId: string;
    subCategory: string;
    images: string[];
    status: "ACTIVE" | "OUT_OF_STOCK" | "DISCONTINUED";
    isOrganic: boolean;
    price: {
      single: number;
      bulk: number;
    };
    discount: {
      type: "percentage" | "fixed";
      value: number;
    };
    stock: number;
    weight: {
      single: {
        value: number;
        unit: string;
      };
      bulk: {
        value: number;
        unit: string;
      };
    };
    minimumOrderQuantity?: number;
    maximumOrderQuantity?: number;
    collection?: {
      quantity: number;
      price: number;
      unit?: string;
    }[];
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    slug?: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  },

  // Get All Products
  getAll: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    isOrganic?: boolean;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.category) searchParams.append("category", params.category);
    if (params?.status) searchParams.append("status", params.status);
    if (params?.isOrganic !== undefined)
      searchParams.append("isOrganic", params.isOrganic.toString());
    if (params?.minPrice)
      searchParams.append("minPrice", params.minPrice.toString());
    if (params?.maxPrice)
      searchParams.append("maxPrice", params.maxPrice.toString());
    if (params?.search) searchParams.append("search", params.search);

    const response = await fetch(`${API_BASE_URL}/products?${searchParams}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  },

  // Get Single Product
  getById: async (productId: string) => {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  },

  // Update Product
  update: async (
    productId: string,
    data: Partial<{
      sku: string;
      name: string;
      description: string;
      highlights: string[];
      categoryId: string;
      subCategory: string;
      images: string[];
      status: "ACTIVE" | "OUT_OF_STOCK" | "DISCONTINUED";
      isOrganic: boolean;
      price: {
        single: number;
        bulk: number;
      };
      discount: {
        type: "percentage" | "fixed";
        value: number;
      };
      stock: number;
      weight: {
        single: {
          value: number;
          unit: string;
        };
        bulk: {
          value: number;
          unit: string;
        };
      };
      minimumOrderQuantity: number;
      maximumOrderQuantity: number;
      collection: {
        quantity: number;
        price: number;
        unit?: string;
      }[];
      metaTitle: string;
      metaDescription: string;
      metaKeywords: string[];
      slug: string;
    }>
  ) => {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  },

  // Delete Product
  delete: async (productId: string) => {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  },
};
