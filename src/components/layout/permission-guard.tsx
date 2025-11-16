"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/stores/sessionStore";
import { hasPermission } from "@/lib/utils/permissions";
import { Loader2 } from "lucide-react";

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermission: string;
  fallback?: React.ReactNode;
}

/**
 * Component to guard routes based on permissions
 * Redirects to dashboard if user doesn't have required permission
 */
export function PermissionGuard({
  children,
  requiredPermission,
  fallback,
}: PermissionGuardProps) {
  const router = useRouter();
  const admin = useSessionStore((state) => state.admin);
  const status = useSessionStore((state) => state.status);
  const isLoading = useSessionStore((state) => state.isLoading);

  useEffect(() => {
    // Wait for authentication to complete
    if (isLoading || status === "loading") return;

    // If not authenticated, redirect will be handled by ProtectedRoute
    if (status !== "authenticated" || !admin) return;

    // Check permission
    const hasAccess = hasPermission(admin, requiredPermission);

    if (!hasAccess) {
      // Redirect to dashboard if no permission
      router.push("/dashboard");
    }
  }, [admin, status, isLoading, requiredPermission, router]);

  // Show loading while checking
  if (isLoading || status === "loading") {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      )
    );
  }

  // If not authenticated, don't render (ProtectedRoute will handle redirect)
  if (status !== "authenticated" || !admin) {
    return null;
  }

  // Check permission
  const hasAccess = hasPermission(admin, requiredPermission);

  if (!hasAccess) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this page.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}

