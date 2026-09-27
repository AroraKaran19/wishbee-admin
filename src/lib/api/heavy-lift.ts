import { getAuthHeaders } from '@/lib/utils/auth';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'https://wishbee-web.vercel.app/api';

export interface HeavyLiftGroupProduct {
  _id: string;
  name: string;
  sku?: string;
  images?: string[];
}

export interface HeavyLiftGroup {
  _id: string;
  name: string;
  fee: number;
  products: HeavyLiftGroupProduct[];
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
    request<HeavyLiftGroup>('', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: { name?: string; fee?: number }) =>
    request<HeavyLiftGroup>(`/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  remove: (id: string) => request<null>(`/${id}`, { method: 'DELETE' }),

  setProducts: (id: string, productIds: string[]) =>
    request<{ groupId: string; productIds: string[] }>(`/${id}/products`, {
      method: 'PUT',
      body: JSON.stringify({ productIds }),
    }),
};
