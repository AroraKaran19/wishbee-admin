import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useSessionStore } from "@/stores/sessionStore";
import { getAccessToken } from "@/lib/utils/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://wishbee-web.vercel.app/api";

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important: Include cookies for refresh token
});

// Request interceptor: Automatically add access token to all requests
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    throw error;
  }
);

// Response interceptor: Automatically refresh token on 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const store = useSessionStore.getState();
        // Try to refresh the access token
        const newToken = await store.refreshAccessToken();

        if (newToken) {
          // Update the authorization header with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          // Retry the original request
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, logout the user
        console.error("Token refresh failed, logging out:", refreshError);
        const store = useSessionStore.getState();
        await store.logout();
        // Redirect to login page
        if (globalThis.window !== undefined) {
          globalThis.window.location.href = "/login";
        }
        throw refreshError;
      }
    }

    throw error;
  }
);

export default apiClient;

