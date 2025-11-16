import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/stores/sessionStore";
import { hasPermission, NAVIGATION_PERMISSIONS } from "@/lib/utils/permissions";

/**
 * Hook to guard routes based on permissions
 * Redirects to dashboard if user doesn't have required permission
 */
export function usePermissionGuard(requiredPermission: string) {
  const router = useRouter();
  const admin = useSessionStore((state) => state.admin);
  const status = useSessionStore((state) => state.status);

  useEffect(() => {
    // Wait for authentication to complete
    if (status === "loading") return;

    // If not authenticated, redirect will be handled by ProtectedRoute
    if (status !== "authenticated" || !admin) return;

    // Check permission
    const hasAccess = hasPermission(admin, requiredPermission);

    if (!hasAccess) {
      // Redirect to dashboard if no permission
      router.push("/dashboard");
    }
  }, [admin, status, requiredPermission, router]);
}

/**
 * Hook to check if admin has permission for a navigation item
 */
export function useNavItemPermission(navItemId: string): boolean {
  const admin = useSessionStore((state) => state.admin);
  const requiredPermission = NAVIGATION_PERMISSIONS[navItemId];
  
  if (!requiredPermission) return true; // Allow if no permission mapping
  
  return hasPermission(admin, requiredPermission);
}

