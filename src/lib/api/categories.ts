
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api';

// Category API functions
export const categoryApi = {
  // Create Main Category
  create: async (data: {
    name: string;
    description: string;
    slug: string;
    image?: string;
    isActive?: boolean;
  }) => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        isActive: data.isActive ?? true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Get All Categories
  getAll: async (params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
    search?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());
    if (params?.search) searchParams.append('search', params.search);

    const response = await fetch(`${API_BASE_URL}/categories?${searchParams}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Get Single Category
  getById: async (categoryId: string) => {
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Update Category
  update: async (categoryId: string, data: Partial<{
    name: string;
    description: string;
    slug: string;
    image: string;
    isActive: boolean;
  }>) => {
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Delete Category
  delete: async (categoryId: string) => {
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};

// Subcategory API functions
export const subcategoryApi = {
  // Create Subcategory
  create: async (data: {
    name: string;
    description: string;
    parentCategoryId: string;
    slug: string;
    image?: string;
    isActive?: boolean;
  }) => {
    const response = await fetch(`${API_BASE_URL}/subcategories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        isActive: data.isActive ?? true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Get Subcategories for Category
  getByCategory: async (categoryId: string, params?: {
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}/subcategories?${searchParams}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Get Single Subcategory
  getById: async (subcategoryId: string) => {
    const response = await fetch(`${API_BASE_URL}/subcategories/${subcategoryId}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Update Subcategory
  update: async (subcategoryId: string, data: Partial<{
    name: string;
    description: string;
    parentCategoryId: string;
    slug: string;
    image: string;
    isActive: boolean;
  }>) => {
    const response = await fetch(`${API_BASE_URL}/subcategories/${subcategoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Delete Subcategory
  delete: async (subcategoryId: string) => {
    const response = await fetch(`${API_BASE_URL}/subcategories/${subcategoryId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};
