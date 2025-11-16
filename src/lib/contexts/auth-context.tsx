"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi, AdminLoginResponse } from "@/lib/api/auth";

interface AuthContextType {
  admin: AdminLoginResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminLoginResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if admin data exists in localStorage on mount
  useEffect(() => {
    const storedAdmin = localStorage.getItem("admin");
    if (storedAdmin) {
      try {
        setAdmin(JSON.parse(storedAdmin));
      } catch (error) {
        console.error("Error parsing stored admin data:", error);
        localStorage.removeItem("admin");
      }
    }
    setIsLoading(false);
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch("/api/auth/session", {
        credentials: "include",
      });

      if (!response.ok) {
        // Session is invalid, clear local storage
        localStorage.removeItem("admin");
        setAdmin(null);
        return;
      }

      const data = await response.json();
      if (data.authenticated) {
        // Session is valid, ensure admin data is loaded
        const storedAdmin = localStorage.getItem("admin");
        if (storedAdmin) {
          try {
            const adminData = JSON.parse(storedAdmin);
            setAdmin(adminData);
          } catch (parseError) {
            console.error("Error parsing admin data:", parseError);
            localStorage.removeItem("admin");
            setAdmin(null);
          }
        } else {
          // No admin data in storage, but session is valid - might need to fetch profile
          setAdmin(null);
        }
      } else {
        localStorage.removeItem("admin");
        setAdmin(null);
      }
    } catch (error) {
      console.error("Error checking session:", error);
      localStorage.removeItem("admin");
      setAdmin(null);
    }
  };

  const login = async (email: string, password: string) => {
    const adminData = await authApi.loginAdmin({ email, password });
    localStorage.setItem("admin", JSON.stringify(adminData));
    setAdmin(adminData);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      localStorage.removeItem("admin");
      setAdmin(null);
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        isLoading,
        isAuthenticated: !!admin,
        login,
        logout,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
