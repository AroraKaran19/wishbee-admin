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
 * Automatically generates access token if refreshToken exists but accessToken is missing/invalid
 * @returns Headers object with Authorization header if token is available
 */
export async function getAuthHeaders(): Promise<HeadersInit> {
  const state = useSessionStore.getState();
  let token = getAccessToken();

  // If no valid token, try to generate one if refreshToken exists
  if (!token) {
    try {
      const refreshTokenExists = await state.checkRefreshTokenExists();
      if (refreshTokenExists) {
        token = await state.generateAccessToken();
      }
    } catch (error) {
      console.error("Error generating access token in getAuthHeaders:", error);
      // Continue without token - API will return 401 if needed
    }
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}
