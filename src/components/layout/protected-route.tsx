"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/stores/sessionStore";
import { useSessionManager } from "@/hooks/useSessionManager";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { status, isLoading } = useSessionStore();
  const router = useRouter();
  useSessionManager(); // Initialize session management

  useEffect(() => {
    if (!isLoading && status === "unauthenticated") {
      router.push("/login");
    }
  }, [isLoading, status, router]);

  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (status !== "authenticated") {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}
