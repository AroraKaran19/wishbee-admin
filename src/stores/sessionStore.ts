import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi, AdminLoginResponse } from "@/lib/api/auth";

interface AccessToken {
  token: string;
  expiresAt: Date;
}

interface SessionState {
  admin: AdminLoginResponse | null;
  status: "authenticated" | "unauthenticated" | "loading";
  isLoading: boolean;
  accessToken: AccessToken | null;
  refreshTokenExpiresAt: Date | null;

  // Core actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setStatus: (status: "authenticated" | "unauthenticated" | "loading") => void;
  setLoading: (loading: boolean) => void;

  // Token & session
  generateAccessToken: () => Promise<string>;
  refreshAccessToken: () => Promise<string>;
  refreshRefreshToken: () => Promise<void>;
  checkRefreshTokenExists: () => Promise<boolean>;
  isTokenValid: () => boolean;
  isRefreshTokenExpiringSoon: () => boolean;

  // Profile
  fetchAdminProfile: (token?: string) => Promise<void>;

  // Session restoration (call on app load)
  initializeSession: () => Promise<void>;
}

const REFRESH_TOKEN_EXPIRY_ERROR =
  (err: unknown) =>
    (err as { status?: number; message?: string })?.status === 401 ||
    /refresh token expired|token expired/i.test(
      String((err as { message?: string })?.message ?? "")
    );

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      admin: null,
      status: "unauthenticated",
      isLoading: false,
      accessToken: null,
      refreshTokenExpiresAt: null,

      setStatus: (status) => set({ status }),
      setLoading: (loading) => set({ isLoading: loading }),

      checkRefreshTokenExists: async () => {
        try {
          const res = await fetch("/api/auth/me", { credentials: "include" });
          if (!res.ok) return false;
          const data = await res.json();
          return data.authenticated === true;
        } catch {
          return false;
        }
      },

      isTokenValid: () => {
        const { accessToken } = get();
        if (!accessToken) return false;
        return new Date(accessToken.expiresAt) > new Date();
      },

      isRefreshTokenExpiringSoon: () => {
        const { refreshTokenExpiresAt } = get();
        if (!refreshTokenExpiresAt) return true;
        const hours =
          (new Date(refreshTokenExpiresAt).getTime() - Date.now()) /
          (1000 * 60 * 60);
        return hours <= 24;
      },

      generateAccessToken: async () => {
        try {
          const token = await authApi.generateAccessToken();
          set({
            accessToken: {
              token,
              expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            },
          });
          return token;
        } catch (err: unknown) {
          if (REFRESH_TOKEN_EXPIRY_ERROR(err)) {
            set({
              admin: null,
              status: "unauthenticated",
              accessToken: null,
              refreshTokenExpiresAt: null,
            });
          } else {
            set({ accessToken: null });
          }
          throw err;
        }
      },

      refreshAccessToken: () => get().generateAccessToken(),

      fetchAdminProfile: async (token?: string) => {
        const t = token ?? (await get().generateAccessToken());
        const adminData = await authApi.getProfile(t);
        set({ admin: adminData, status: "authenticated" });
      },

      refreshRefreshToken: async () => {
        await authApi.refreshToken();
        set({
          refreshTokenExpiresAt: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000
          ),
        });
      },

      initializeSession: async () => {
        const state = get();
        if (state.isLoading) return;
        if (
          state.status === "authenticated" &&
          state.accessToken &&
          get().isTokenValid()
        ) {
          return;
        }

        set({ isLoading: true });

        try {
          const hasCookie = await get().checkRefreshTokenExists();
          if (!hasCookie) {
            set({
              status: "unauthenticated",
              admin: null,
              accessToken: null,
              refreshTokenExpiresAt: null,
            });
            return;
          }

          // Get access token (with retries for transient errors)
          let token: string | null = null;
          const maxRetries = 3;

          for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
              token = await get().generateAccessToken();
              break;
            } catch (err: unknown) {
              if (REFRESH_TOKEN_EXPIRY_ERROR(err)) {
                set({
                  status: "unauthenticated",
                  admin: null,
                  accessToken: null,
                  refreshTokenExpiresAt: null,
                });
                return;
              }
              if (attempt === maxRetries - 1) {
                set({ status: "unauthenticated" });
                return;
              }
              await new Promise((r) =>
                setTimeout(r, 1000 * (attempt + 1))
              );
            }
          }

          if (!token) return;

          // Fetch profile
          try {
            await get().fetchAdminProfile(token);
          } catch {
            const { accessToken } = get();
            if (accessToken && get().isTokenValid()) {
              set({ status: "authenticated" });
            } else {
              set({ status: "unauthenticated" });
            }
          }
        } catch (err) {
          console.error("Session init error:", err);
          const hasCookie = await get().checkRefreshTokenExists().catch(() => false);
          set({
            status: "unauthenticated",
            ...(!hasCookie && {
              admin: null,
              accessToken: null,
              refreshTokenExpiresAt: null,
            }),
          });
        } finally {
          set({ isLoading: false });
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true, status: "loading" });
        try {
          const adminData = await authApi.loginAdmin({ email, password });
          set({
            admin: adminData,
            status: "authenticated",
            refreshTokenExpiresAt: new Date(
              Date.now() + 365 * 24 * 60 * 60 * 1000
            ),
          });
          await get().generateAccessToken();
          try {
            await get().fetchAdminProfile();
          } catch (e) {
            console.error("Profile fetch after login:", e);
          }
        } catch (err) {
          set({
            admin: null,
            status: "unauthenticated",
            accessToken: null,
            refreshTokenExpiresAt: null,
          });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        const { accessToken } = get();
        set({
          admin: null,
          status: "unauthenticated",
          accessToken: null,
          refreshTokenExpiresAt: null,
          isLoading: false,
        });
        try {
          if (accessToken?.token) await authApi.logout(accessToken.token);
        } catch (e) {
          console.error("Logout error:", e);
        }
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
      partialize: (s) =>
        ({
          admin: s.admin ?? null,
          status: s.status ?? "unauthenticated",
          accessToken: s.accessToken ?? null,
          refreshTokenExpiresAt: s.refreshTokenExpiresAt ?? null,
        }) as SessionState,
    }
  )
);
