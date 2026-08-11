import { getAuthHeaders } from '@/lib/utils/auth';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'https://wishbee-web.vercel.app/api';

export interface EnquiryUser {
  _id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  role: string;
}

export interface Enquiry {
  _id: string;
  /** Null when the referenced user has been deleted, leaving the enquiry orphaned. */
  user: EnquiryUser | null;
  type: string;
  message: string;
  images?: string[];
  status: 'PENDING' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}

export interface EnquiryFilters {
  page?: number;
  limit?: number;
  type?: string;
  status?: 'PENDING' | 'RESOLVED' | 'CLOSED';
  userId?: string;
}

export interface EnquiryResponse {
  enquiries: Enquiry[];
  total: number;
  totalPages: number;
  page: number;
}

export const enquiryApi = {
  // Get all enquiries (Admin)
  getAll: async (filters: EnquiryFilters = {}): Promise<EnquiryResponse> => {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.userId) params.append('userId', filters.userId);

    const response = await fetch(`${API_BASE_URL}/enquiry/all?${params.toString()}`, {
      method: 'GET',
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch enquiries: ${response.statusText}`
      );
    }

    const result = await response.json();
    return result.data;
  },

  // Get enquiry by ID
  getById: async (enquiryId: string): Promise<Enquiry> => {
    const response = await fetch(`${API_BASE_URL}/enquiry/${enquiryId}`, {
      method: 'GET',
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch enquiry: ${response.statusText}`
      );
    }

    const result = await response.json();
    return result.data;
  },

  // Update enquiry status
  update: async (
    enquiryId: string,
    status: 'PENDING' | 'RESOLVED' | 'CLOSED'
  ): Promise<Enquiry> => {
    const response = await fetch(`${API_BASE_URL}/enquiry/${enquiryId}`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to update enquiry: ${response.statusText}`
      );
    }

    const result = await response.json();
    return result.data;
  },

  // Delete enquiry
  delete: async (enquiryId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/enquiry/${enquiryId}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to delete enquiry: ${response.statusText}`
      );
    }
  },
};

