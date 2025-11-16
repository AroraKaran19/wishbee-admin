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
  refreshTokenExpiresAt: Date | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  generateAccessToken: () => Promise<string>;
  refreshRefreshToken: () => Promise<void>;
  checkRefreshTokenExists: () => Promise<boolean>;
  isTokenValid: () => boolean;
  isRefreshTokenExpiringSoon: () => boolean;
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

      // Check if refresh token is expiring soon (within 24 hours)
      isRefreshTokenExpiringSoon: () => {
        const { refreshTokenExpiresAt } = get();
        if (!refreshTokenExpiresAt) return false;
        const expiresAt = new Date(refreshTokenExpiresAt);
        const now = new Date();
        const hoursUntilExpiry =
          (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
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
        } catch (error) {
          console.error("Error generating access token:", error);
          // If token generation fails, clear session
          set({
            admin: null,
            status: "unauthenticated",
            accessToken: null,
            refreshTokenExpiresAt: null,
          });
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
          set({
            refreshTokenExpiresAt: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000
            ), // 7 days
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
            refreshTokenExpiresAt: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000
            ), // 7 days
          });
          // Generate access token immediately after login
          await get().generateAccessToken();
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
            refreshTokenExpiresAt: null,
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
