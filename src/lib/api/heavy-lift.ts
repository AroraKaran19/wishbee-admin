import { getAuthHeaders } from '@/lib/utils/auth';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'https://wishbee-web.vercel.app/api';

export interface HeavyLiftGroupProduct {
  _id: string;
  name: string;
  sku?: string;
  images?: string[];
  heavyLiftGroup?: string | null;
}

export interface HeavyLiftGroup {
  _id: string;
  name: string;
  fee: number;
  productCount: number;
  preview: HeavyLiftGroupProduct[];
}

export interface HeavyLiftProductPage {
  products: HeavyLiftGroupProduct[];
  total: number;
  page: number;
  totalPages: number;
}

const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}/heavy-lift-groups${path}`, {
    ...init,
    headers: await getAuthHeaders(),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.message || `Request failed: ${response.statusText}`);
  }
  return body.data as T;
};

export const heavyLiftApi = {
  list: () => request<HeavyLiftGroup[]>(''),

  create: (data: { name: string; fee: number }) =>
    request<{ _id: string; name: string; fee: number }>('', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: { name?: string; fee?: number }) =>
    request<{ _id: string; name: string; fee: number }>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  remove: (id: string) => request<null>(`/${id}`, { method: 'DELETE' }),

  products: (id: string, params: { page: number; limit: number; search?: string }) => {
    const query = new URLSearchParams({ page: String(params.page), limit: String(params.limit) });
    if (params.search?.trim()) query.set('search', params.search.trim());
    return request<HeavyLiftProductPage>(`/${id}/products?${query}`);
  },

  updateProducts: (id: string, changes: { add: string[]; remove: string[] }) =>
    request<{ groupId: string; added: number; removed: number }>(`/${id}/products`, {
      method: 'PATCH',
      body: JSON.stringify(changes),
    }),
};
