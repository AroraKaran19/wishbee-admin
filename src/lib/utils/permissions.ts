import { ADMIN_PERMISSIONS } from "@/lib/constants/permissions";
import { AdminLoginResponse } from "@/lib/api/auth";

/**
 * Check if admin has a specific permission
 * SUPER_ADMIN always has all permissions
 */
export function hasPermission(
  admin: AdminLoginResponse | null,
  permission: string
): boolean {
  if (!admin) return false;
  
  // SUPER_ADMIN has all permissions
  if (admin.role === "SUPER_ADMIN") {
    return true;
  }
  
  // Check if admin has the specific permission
  return admin.permissions?.includes(permission) ?? false;
}

/**
 * Map navigation item ID to required permission
 */
export const NAVIGATION_PERMISSIONS: Record<string, string> = {
  dashboard: ADMIN_PERMISSIONS.DASHBOARD,
  inventory: ADMIN_PERMISSIONS.INVENTORY,
  orders: ADMIN_PERMISSIONS.ORDERS,
  customers: ADMIN_PERMISSIONS.CUSTOMERS,
  "offers-banners": ADMIN_PERMISSIONS.OFFERS_BANNERS,
  analytics: ADMIN_PERMISSIONS.ANALYTICS,
  "most-selling": ADMIN_PERMISSIONS.MOST_SELLING,
  settings: ADMIN_PERMISSIONS.SETTINGS,
  admins: ADMIN_PERMISSIONS.ADMINS,
  support: ADMIN_PERMISSIONS.SUPPORT,
};

/**
 * Check if admin can access a navigation item
 */
export function canAccessNavItem(
  admin: AdminLoginResponse | null,
  navItemId: string
): boolean {
  const requiredPermission = NAVIGATION_PERMISSIONS[navItemId];
  
  // If no permission mapping exists, allow access (for backward compatibility)
  if (!requiredPermission) {
    return true;
  }
  
  return hasPermission(admin, requiredPermission);
}

