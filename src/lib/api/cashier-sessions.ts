import { getAuthHeaders } from '@/lib/utils/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface CashierSessionCashier {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface CashierSession {
  _id: string;
  cashier: CashierSessionCashier | string | null;
  date: string;
  openingBalance: number | null;
  closingBalance: number | null;
  status: 'ACTIVE' | 'CLOSED';
  startedAt: string;
  endedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CashierSessionsFilters {
  fromDate?: string;
  toDate?: string;
  cashierId?: string;
  status?: 'ACTIVE' | 'CLOSED';
  page?: number;
  limit?: number;
}

export interface CashierSessionsResponse {
  sessions: CashierSession[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

export interface TodaySessionResponse {
  _id: string;
  cashier: string;
  date: string;
  openingBalance: number | null;
  closingBalance: number | null;
  status: 'ACTIVE' | 'CLOSED';
  startedAt: string;
  createdAt: string;
  updatedAt: string;
}

export const cashierSessionsApi = {
  getSessions: async (filters: CashierSessionsFilters = {}): Promise<CashierSessionsResponse> => {
    const params = new URLSearchParams();
    if (filters.fromDate) params.append('fromDate', filters.fromDate);
    if (filters.toDate) params.append('toDate', filters.toDate);
    if (filters.cashierId) params.append('cashierId', filters.cashierId);
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await fetch(
      `${API_BASE_URL}/orders/pos/sessions?${params.toString()}`,
      {
        method: 'GET',
        headers: await getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch sessions: ${response.statusText}`
      );
    }

    const result = await response.json();
    const data = result.data ?? result;
    return {
      sessions: data.sessions ?? [],
      total: data.total ?? 0,
      totalPages: data.totalPages ?? 1,
      page: data.page ?? 1,
      limit: data.limit ?? 20,
    };
  },

  getTodaySession: async (): Promise<TodaySessionResponse | null> => {
    const response = await fetch(`${API_BASE_URL}/orders/pos/session`, {
      method: 'GET',
      headers: await getAuthHeaders(),
    });

    if (response.status === 403) {
      return null;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch today's session: ${response.statusText}`
      );
    }

    const result = await response.json();
    return result.data ?? result;
  },

  setOpeningBalance: async (openingBalance: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/orders/pos/session`, {
      method: 'PATCH',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ openingBalance }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to set opening balance: ${response.statusText}`
      );
    }
  },

  endSession: async (
    sessionId: string,
    closingBalance: number
  ): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/orders/pos/session/end`, {
      method: 'PATCH',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ sessionId, closingBalance }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to end session: ${response.statusText}`
      );
    }
  },
};
