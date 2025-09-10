export interface Product {
  id: string;
  name: string;
  category: string;
  buyingPrice: number;
  stockQuantity: number;
  lastSoldDate: string;
  expiryDate: string;
  availabilityStatus: 'in-stock' | 'out-of-stock';
}

export interface InventorySummary {
  totalCategories: number;
  inventoryValue: number;
  revenueGenerated: number;
  trends: {
    totalCategories: { value: number; percentage: number };
    inventoryValue: { value: number; percentage: number };
    revenueGenerated: { value: number; percentage: number };
  };
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  hasDropdown?: boolean;
}