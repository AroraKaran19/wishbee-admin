import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi, AdminLoginResponse } from "@/lib/api/auth";

interface AccessToken {
  token: string;
  expiresAt: Date;
}

interface SessionState {
  // Admin data
  admin: AdminLoginResponse | null;
  status: "authenticated" | "unauthenticated" | "loading";
  isLoading: boolean;

  // Tokens
  accessToken: AccessToken | null;
  lastRefreshTokenRefresh: Date | null; // Track when we last refreshed the refresh token

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  generateAccessToken: () => Promise<string>;
  refreshRefreshToken: () => Promise<void>;
  checkRefreshTokenExists: () => Promise<boolean>;
  isTokenValid: () => boolean;
  isRefreshTokenExpiringSoon: () => Promise<boolean>; // Now async to check with backend
  fetchAdminProfile: () => Promise<void>;
  setStatus: (status: "authenticated" | "unauthenticated" | "loading") => void;
  setLoading: (loading: boolean) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      // Initial state
      admin: null,
      status: "unauthenticated",
      isLoading: false,
      accessToken: null,
      lastRefreshTokenRefresh: null,

      // Set status
      setStatus: (status) => set({ status }),

      // Set loading
      setLoading: (loading) => set({ isLoading: loading }),

      // Check if refresh token exists
      checkRefreshTokenExists: async () => {
        try {
          const response = await fetch("/api/auth/session", {
            credentials: "include",
          });
          return response.ok;
        } catch {
          return false;
        }
      },

      // Check if access token is valid
      isTokenValid: () => {
        const { accessToken } = get();
        if (!accessToken) return false;
        return new Date(accessToken.expiresAt) > new Date();
      },

      // Check if refresh token is expiring soon
      // Since refresh token is HTTP-only, we can't read its expiration
      // Instead, we check if it's been more than 6 days since last refresh
      // (refresh tokens expire in 7 days, so we refresh proactively)
      isRefreshTokenExpiringSoon: async () => {
        const { lastRefreshTokenRefresh } = get();
        if (!lastRefreshTokenRefresh) {
          // If we don't have a record, check with backend
          return !(await get().checkRefreshTokenExists());
        }
        const lastRefresh = new Date(lastRefreshTokenRefresh);
        const now = new Date();
        const daysSinceRefresh =
          (now.getTime() - lastRefresh.getTime()) / (1000 * 60 * 60 * 24);
        // Refresh if it's been more than 6 days (refresh tokens expire in 7 days)
        return daysSinceRefresh >= 6;
      },

      // Generate access token
      generateAccessToken: async () => {
        try {
          const token = await authApi.generateAccessToken();
          const accessTokenData = {
            token,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
          };
          set({
            accessToken: accessTokenData,
          });
          return token;
        } catch (error: any) {
          console.error("Error generating access token:", error);
          
          // Check if error is due to refresh token expiry (401/403)
          // Only clear session if refresh token is actually expired
          const isRefreshTokenExpired = 
            error?.message?.includes("401") || 
            error?.message?.includes("403") ||
            error?.message?.toLowerCase().includes("unauthorized") ||
            error?.message?.toLowerCase().includes("forbidden") ||
            error?.message?.toLowerCase().includes("refresh token expired");
          
          if (isRefreshTokenExpired) {
            // Refresh token expired - clear session
            set({
              admin: null,
              status: "unauthenticated",
              accessToken: null,
              lastRefreshTokenRefresh: null,
            });
          } else {
            // Temporary error (network, etc.) - don't clear session
            // Just clear the access token so it can be retried
            set({
              accessToken: null,
            });
          }
          throw error;
        }
      },

      // Fetch and restore admin profile
      fetchAdminProfile: async () => {
        try {
          // First generate access token
          const token = await get().generateAccessToken();
          // Then fetch profile
          const adminData = await authApi.getProfile(token);
          set({
            admin: adminData,
            status: "authenticated",
          });
        } catch (error) {
          console.error("Error fetching admin profile:", error);
          throw error;
        }
      },

      // Refresh refresh token
      refreshRefreshToken: async () => {
        try {
          await authApi.refreshToken();
          // Track when we last refreshed (refresh token expires in 7 days from backend)
          set({
            lastRefreshTokenRefresh: new Date(),
          });
        } catch (error) {
          console.error("Error refreshing refresh token:", error);
          throw error;
        }
      },

      // Login
      login: async (email: string, password: string) => {
        set({ isLoading: true, status: "loading" });
        try {
          const adminData = await authApi.loginAdmin({ email, password });
          set({
            admin: adminData,
            status: "authenticated",
            lastRefreshTokenRefresh: new Date(), // Track when login happened (refresh token set by backend)
          });
          // Generate access token immediately after login
          await get().generateAccessToken();
          
          // Fetch full profile to get firstName, lastName, photo, etc.
          // The login response only includes basic fields, so we need to fetch the complete profile
          try {
            await get().fetchAdminProfile();
          } catch (profileError) {
            console.error("Error fetching admin profile after login:", profileError);
            // Don't fail login if profile fetch fails - we still have basic admin data
          }
        } catch (error) {
          set({
            admin: null,
            status: "unauthenticated",
            accessToken: null,
            lastRefreshTokenRefresh: null,
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Logout
      logout: async () => {
        const { accessToken } = get();
        try {
          if (accessToken?.token) {
            await authApi.logout(accessToken.token);
          }
        } catch (error) {
          console.error("Error during logout:", error);
        } finally {
          // Clear all session data
          set({
            admin: null,
            status: "unauthenticated",
            accessToken: null,
            lastRefreshTokenRefresh: null,
          });
        }
      },
    }),
    {
      name: "admin-session-storage",
      storage: {
        getItem: (name) => {
          if (typeof window === "undefined") return null;
          const str = sessionStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          // Convert date strings back to Date objects
          if (parsed.state?.accessToken?.expiresAt) {
            parsed.state.accessToken.expiresAt = new Date(
              parsed.state.accessToken.expiresAt
            );
          }
          if (parsed.state?.lastRefreshTokenRefresh) {
            parsed.state.lastRefreshTokenRefresh = new Date(
              parsed.state.lastRefreshTokenRefresh
            );
          }
          return parsed;
        },
        setItem: (name, value) => {
          if (typeof window === "undefined") return;
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          if (typeof window === "undefined") return;
          sessionStorage.removeItem(name);
        },
      },
      partialize: (state: SessionState) => ({
        admin: state.admin ?? null,
        status: state.status ?? "unauthenticated",
        accessToken: state.accessToken ?? null,
        lastRefreshTokenRefresh: state.lastRefreshTokenRefresh ?? null,
      }),
    }
  )
);
