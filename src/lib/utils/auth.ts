import { useSessionStore } from "@/stores/sessionStore";

/**
 * Get the current access token from the session store
 * @returns Access token string or null if not available
 */
export function getAccessToken(): string | null {
  const state = useSessionStore.getState();
  if (state.accessToken && state.isTokenValid()) {
    return state.accessToken.token;
  }
  return null;
}

/**
 * Get authorization headers for API requests
 * @returns Headers object with Authorization header if token is available
 */
export function getAuthHeaders(): HeadersInit {
  const token = getAccessToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}
