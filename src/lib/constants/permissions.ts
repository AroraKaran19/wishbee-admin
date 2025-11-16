/**
 * Admin Permission Constants
 * 
 * These constants define the permission strings for each admin tab/section.
 * The main admin can assign these permissions to other admin users to control
 * which tabs they can access.
 */

export const ADMIN_PERMISSIONS = {
  // Dashboard permission
  DASHBOARD: "DASHBOARD",
  
  // Inventory permission (for managing products, stock, etc.)
  INVENTORY: "INVENTORY",
  
  // Orders permission (for viewing and managing orders)
  ORDERS: "ORDERS",
  
  // Customers permission (for viewing and managing customers)
  CUSTOMERS: "CUSTOMERS",
  
  // Offers & Banners permission (for managing offers, banners, coupons)
  OFFERS_BANNERS: "OFFERS_BANNERS",
  
  // Analytics permission (for viewing analytics and reports)
  ANALYTICS: "ANALYTICS",
  
  // Most Selling permission (for viewing most selling products)
  MOST_SELLING: "MOST_SELLING",
  
  // Settings permission (for accessing settings)
  SETTINGS: "SETTINGS",
  
  // Admins permission (for managing other admin users)
  ADMINS: "ADMINS",
  
  // Support permission (for customer support and enquiries)
  SUPPORT: "SUPPORT",
} as const;

/**
 * Type for admin permission values
 */
export type AdminPermission = typeof ADMIN_PERMISSIONS[keyof typeof ADMIN_PERMISSIONS];

/**
 * Array of all available permissions
 */
export const ALL_PERMISSIONS: AdminPermission[] = Object.values(ADMIN_PERMISSIONS);

