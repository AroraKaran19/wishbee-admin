const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL;

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_BACKEND_URL is not set");
}

// Get presigned URL for S3 upload
export const getPresignedUrl = async (fileName: string, fileType: string, folder: string = "products") => {
  const response = await fetch(`${API_BASE_URL}/upload/presigned-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileName,
      folder,
      contentType: fileType,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }

  const result = await response.json();
  
  // Check if the response indicates success
  if (!result.success) {
    throw new Error(result.message || 'Failed to get presigned URL');
  }
  
  // Use the response structure from your API
  const presignedUrl = result.data?.url;
  const s3Key = result.data?.key;
  
  if (!presignedUrl) {
    console.error('Missing url in response:', result);
    throw new Error('Invalid response: url not found');
  }
  
  if (!s3Key) {
    console.error('Missing key in response:', result);
    throw new Error('Invalid response: key not found');
  }
  
  const fullS3Key = presignedUrl.split('?')[0].split('/').slice(-3).join('/');
  
  // Extract bucket URL from presigned URL (everything before the first '?')
  const bucketUrl = presignedUrl.split('?')[0].replace(`/${fullS3Key}`, '');
  
  return {
    presignedUrl: presignedUrl,
    imageUrl: `${bucketUrl}/${fullS3Key}`,
  };
};

// Delete image from S3
export const deleteImage = async (imageKey: string) => {
  const response = await fetch(`${API_BASE_URL}/upload/delete?key=${encodeURIComponent(imageKey)}`, {
    method: "DELETE",
  });

  const result = await response.json();

  // Check if the response indicates success
  if (!result.success) {
    throw new Error(result.message || 'Failed to delete image');
  }

  return result;
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
    productCollections?: {
      quantity: number;
      price: number;
      unit?: string;
    }[];
    expiry?: string;
    alertExpiry?: number;
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

    const response = await fetch(`${API_BASE_URL}/products?${searchParams}`, {
      headers: {
      },
    });

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
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      headers: {
      },
    });

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
      productCollections: {
        quantity: number;
        price: number;
        unit?: string;
      }[];
      expiry: string;
      alertExpiry: number;
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
      headers: {
      },
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
