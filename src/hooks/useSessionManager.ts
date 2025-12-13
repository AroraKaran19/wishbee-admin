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

  // Track if initialization is in progress to prevent duplicate calls
  const initializingRef = useRef(false);

  // Initialize session on mount
  useEffect(() => {
    // Prevent duplicate initialization
    if (initializingRef.current) {
      return;
    }

    const currentState = useSessionStore.getState();
    
    // If already authenticated with valid token, skip initialization
    if (currentState.status === "authenticated" && currentState.accessToken && isTokenValid()) {
      return;
    }

    // If already loading, wait for it to complete
    if (currentState.isLoading) {
      return;
    }

    initializingRef.current = true;
    let isMounted = true;

    const initializeSession = async () => {
      setLoading(true);
      try {
        // Check if refresh token exists
        const refreshTokenExists = await checkRefreshTokenExists();

        if (!isMounted) {
          initializingRef.current = false;
          return;
        }

        if (refreshTokenExists) {
          // Get current state again to check access token
          const currentState = useSessionStore.getState();
          const hasValidToken = currentState.accessToken && isTokenValid();

          if (!hasValidToken) {
            // Generate new access token with retry logic
            let retries = 3;
            let lastError: Error | null = null;
            
            while (retries > 0 && isMounted) {
              try {
                await generateAccessToken();
                lastError = null;
                break;
              } catch (error: any) {
                lastError = error;
                // Check if it's a refresh token expiry error
                const isRefreshTokenExpired = 
                  error?.message?.includes("401") || 
                  error?.message?.includes("403") ||
                  error?.message?.toLowerCase().includes("unauthorized") ||
                  error?.message?.toLowerCase().includes("forbidden");
                
                if (isRefreshTokenExpired) {
                  // Refresh token expired, don't retry
                  if (isMounted) {
                    setStatus("unauthenticated");
                  }
                  initializingRef.current = false;
                  return;
                }
                
                // Wait before retry (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
                retries--;
              }
            }

            if (lastError && isMounted) {
              // All retries failed, but refresh token might still be valid
              // Don't clear session, just set status based on current state
              const state = useSessionStore.getState();
              if (state.admin) {
                setStatus("authenticated");
              } else {
                setStatus("unauthenticated");
              }
              initializingRef.current = false;
              return;
            }
          }

          if (!isMounted) {
            initializingRef.current = false;
            return;
          }

          // Get current state again to check admin
          const currentStateAfterToken = useSessionStore.getState();
          // If we successfully restored session but don't have lastRefreshTokenRefresh, set it to now
          // This ensures we track when the refresh token was last known to be valid
          if (!currentStateAfterToken.lastRefreshTokenRefresh) {
            useSessionStore.setState({ lastRefreshTokenRefresh: new Date() });
          }
          
          // If we have admin data, check if it has complete profile info (firstName/lastName)
          // If not, fetch the full profile to get complete admin data
          if (currentStateAfterToken.admin) {
            // Check if we have complete profile data (firstName or lastName)
            const hasCompleteProfile = currentStateAfterToken.admin.firstName || currentStateAfterToken.admin.lastName;
            
            if (!hasCompleteProfile) {
              // Admin data exists but incomplete - fetch full profile
              try {
                await fetchAdminProfile();
              } catch (error) {
                console.error("Error fetching admin profile:", error);
                // Even if profile fetch fails, we still have basic admin data, so set as authenticated
                setStatus("authenticated");
              }
            } else {
              // We have complete profile data
              setStatus("authenticated");
            }
          } else {
            // No admin data but valid session - fetch profile to restore admin data
            try {
              await fetchAdminProfile();
            } catch (error) {
              console.error("Error fetching admin profile:", error);
              // If profile fetch fails, check if refresh token is still valid
              const stillHasRefreshToken = await checkRefreshTokenExists();
              if (isMounted) {
                if (stillHasRefreshToken) {
                  // Refresh token exists but profile fetch failed - keep as authenticated if we have token
                  const state = useSessionStore.getState();
                  if (state.accessToken && isTokenValid()) {
                    setStatus("authenticated");
                  } else {
                    setStatus("unauthenticated");
                  }
                } else {
                  setStatus("unauthenticated");
                }
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
          // Don't immediately set to unauthenticated - check if refresh token still exists
          const refreshTokenExists = await checkRefreshTokenExists().catch(() => false);
          if (!refreshTokenExists) {
            setStatus("unauthenticated");
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          initializingRef.current = false;
        }
      }
    };

    initializeSession();

    return () => {
      isMounted = false;
      initializingRef.current = false;
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

      if (await isRefreshTokenExpiringSoon()) {
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
