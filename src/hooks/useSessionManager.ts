import { useEffect, useRef } from "react";
import { useSessionStore } from "@/stores/sessionStore";

export function useSessionManager() {
  const {
    admin,
    status,
    isLoading,
    accessToken,
    checkRefreshTokenExists,
    generateAccessToken,
    refreshRefreshToken,
    isTokenValid,
    isRefreshTokenExpiringSoon,
    fetchAdminProfile,
    setStatus,
    setLoading,
  } = useSessionStore();

  // Track if initialization has been attempted
  const initializedRef = useRef(false);

  // Initialize session on mount (only once)
  useEffect(() => {
    // Skip if already initialized
    if (initializedRef.current) {
      return;
    }

    // Get current state from store to check if already authenticated
    const currentState = useSessionStore.getState();
    if (currentState.status === "authenticated" || currentState.isLoading) {
      initializedRef.current = true;
      return;
    }

    initializedRef.current = true;
    let isMounted = true;

    const initializeSession = async () => {
      setLoading(true);
      try {
        // Check if refresh token exists
        const refreshTokenExists = await checkRefreshTokenExists();

        if (!isMounted) return;

        if (refreshTokenExists) {
          // Get current state again to check access token
          const currentState = useSessionStore.getState();
          const hasValidToken = currentState.accessToken && isTokenValid();

          if (!hasValidToken) {
            // Generate new access token
            await generateAccessToken();
          }

          if (!isMounted) return;

          // Get current state again to check admin
          const currentStateAfterToken = useSessionStore.getState();
          // If we have admin data, set status to authenticated
          if (currentStateAfterToken.admin) {
            setStatus("authenticated");
          } else {
            // No admin data but valid session - fetch profile to restore admin data
            try {
              await fetchAdminProfile();
            } catch (error) {
              console.error("Error fetching admin profile:", error);
              // If profile fetch fails, set to unauthenticated
              if (isMounted) {
                setStatus("unauthenticated");
              }
            }
          }
        } else {
          // No valid session
          if (isMounted) {
            setStatus("unauthenticated");
          }
        }
      } catch (error) {
        console.error("Error initializing session:", error);
        if (isMounted) {
          setStatus("unauthenticated");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeSession();

    return () => {
      isMounted = false;
    };
  }, []); // Only run once on mount

  // Auto-refresh access token every 14 minutes
  useEffect(() => {
    // Only set up interval if authenticated
    if (status !== "authenticated") {
      return;
    }

    const tokenRefreshInterval = setInterval(async () => {
      const currentState = useSessionStore.getState();
      if (currentState.status !== "authenticated") {
        return;
      }

      const refreshTokenExists = await checkRefreshTokenExists();
      if (refreshTokenExists) {
        const state = useSessionStore.getState();
        if (!state.accessToken || !isTokenValid()) {
          try {
            await generateAccessToken();
          } catch (error) {
            console.error("Error refreshing access token:", error);
          }
        }
      }
    }, 14 * 60 * 1000); // 14 minutes

    return () => clearInterval(tokenRefreshInterval);
  }, [status]); // Only recreate when status changes

  // Refresh refresh token if expiring soon
  useEffect(() => {
    // Only set up interval if authenticated
    if (status !== "authenticated") {
      return;
    }

    const refreshTokenRefreshInterval = setInterval(async () => {
      const currentState = useSessionStore.getState();
      if (currentState.status !== "authenticated") {
        return;
      }

      if (isRefreshTokenExpiringSoon()) {
        try {
          await refreshRefreshToken();
        } catch (error) {
          console.error("Error refreshing refresh token:", error);
        }
      }
    }, 6 * 60 * 60 * 1000); // Check every 6 hours

    return () => clearInterval(refreshTokenRefreshInterval);
  }, [status]); // Only recreate when status changes

  return {
    admin,
    status,
    isLoading,
  };
}
