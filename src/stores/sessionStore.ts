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
  refreshTokenExpiresAt: Date | null; // Track refresh token expiry (7 days from login/refresh)

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  generateAccessToken: () => Promise<string>;
  refreshAccessToken: () => Promise<string>; // Alias for generateAccessToken for clarity
  refreshRefreshToken: () => Promise<void>;
  checkRefreshTokenExists: () => Promise<boolean>;
  isTokenValid: () => boolean;
  isRefreshTokenExpiringSoon: () => boolean; // Check if refresh token expires within 24 hours
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
      refreshTokenExpiresAt: null,

      // Set status
      setStatus: (status) => set({ status }),

      // Set loading
      setLoading: (loading) => set({ isLoading: loading }),

      // Check if refresh token exists
      checkRefreshTokenExists: async () => {
        try {
          const response = await fetch("/api/auth/me", {
            credentials: "include",
          });
          if (response.ok) {
            const data = await response.json();
            // If we get user data, refresh token is valid
            return data.authenticated === true;
          }
          return false;
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

      // Check if refresh token is expiring soon (within 24 hours)
      isRefreshTokenExpiringSoon: () => {
        const { refreshTokenExpiresAt } = get();
        if (!refreshTokenExpiresAt) {
          return true; // If we don't know, assume it's expiring soon
        }
        const now = new Date();
        const expiresAt = new Date(refreshTokenExpiresAt);
        const hoursUntilExpiry =
          (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
        // Return true if expires within 24 hours
        return hoursUntilExpiry <= 24;
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
            error?.status === 401 || 
            error?.status === 403 ||
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
              refreshTokenExpiresAt: null,
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

      // Alias for generateAccessToken (for clarity in interceptors)
      refreshAccessToken: async () => {
        return get().generateAccessToken();
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
          // Update refresh token expiry to 7 days from now
          set({
            refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
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
            refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from login
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
            refreshTokenExpiresAt: null,
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Logout
      logout: async () => {
        const { accessToken } = get();
        
        // Clear all session data FIRST before making API call
        // This prevents any race conditions with session checks
        set({
          admin: null,
          status: "unauthenticated",
          accessToken: null,
          refreshTokenExpiresAt: null,
          isLoading: false,
        });
        
        try {
          if (accessToken?.token) {
            await authApi.logout(accessToken.token);
          }
        } catch (error) {
          console.error("Error during logout:", error);
        }
        
        // Redirect to login page (not home page to avoid triggering session check)
        if (typeof window !== "undefined") {
          window.location.href = "/login";
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
          if (parsed.state?.refreshTokenExpiresAt) {
            parsed.state.refreshTokenExpiresAt = new Date(
              parsed.state.refreshTokenExpiresAt
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
        refreshTokenExpiresAt: state.refreshTokenExpiresAt ?? null,
      }),
    }
  )
);
