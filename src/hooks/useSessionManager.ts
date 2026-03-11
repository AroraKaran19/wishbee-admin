import { useEffect } from "react";
import { useSessionStore } from "@/stores/sessionStore";

/**
 * Session manager hook. Call from root layout or pages that need auth.
 * - Runs initializeSession on mount when not already authenticated.
 * - Auto-refreshes access token every 14 minutes.
 * - Refreshes refresh token when expiring soon (every 6h check).
 */
export function useSessionManager() {
  const {
    status,
    isLoading,
    initializeSession,
    checkRefreshTokenExists,
    generateAccessToken,
    refreshRefreshToken,
    isTokenValid,
    isRefreshTokenExpiringSoon,
  } = useSessionStore();

  // Restore session from refresh token cookie on mount
  useEffect(() => {
    const state = useSessionStore.getState();
    if (
      state.status === "authenticated" &&
      state.accessToken &&
      state.isTokenValid()
    ) {
      return;
    }
    initializeSession();
  }, [initializeSession]);

  // Auto-refresh access token every 14 minutes when authenticated
  useEffect(() => {
    if (status !== "authenticated") return;

    const interval = setInterval(async () => {
      const s = useSessionStore.getState();
      if (s.status !== "authenticated") return;
      const hasCookie = await checkRefreshTokenExists();
      if (!hasCookie) return;
      const { accessToken, isTokenValid } = s;
      if (accessToken && isTokenValid()) return;
      try {
        await generateAccessToken();
      } catch (e) {
        console.error("Access token refresh:", e);
      }
    }, 14 * 60 * 1000);

    return () => clearInterval(interval);
  }, [status, checkRefreshTokenExists, generateAccessToken]);

  // Refresh refresh token when expiring soon (check every 6 hours)
  useEffect(() => {
    if (status !== "authenticated") return;

    const interval = setInterval(async () => {
      const s = useSessionStore.getState();
      if (s.status !== "authenticated") return;
      if (await isRefreshTokenExpiringSoon()) {
        try {
          await refreshRefreshToken();
        } catch (e) {
          console.error("Refresh token refresh:", e);
        }
      }
    }, 6 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [status, isRefreshTokenExpiringSoon, refreshRefreshToken]);

  return {
    admin: useSessionStore((s) => s.admin),
    status,
    isLoading,
  };
}
