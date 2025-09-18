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
  subItems?: NavSubItem[];
}

export interface NavSubItem {
  id: string;
  label: string;
  href: string;
}

export interface OutOfStockItem {
  id: string;
  productName: string;
  category: string;
  lastStockDate: string;
  supplierName: string;
}

export interface LowQuantityItem {
  id: string;
  productName: string;
  availableQuantity: number;
  thresholdLevel: number;
  supplierName: string;
  unit: string;
}

export interface ExpiredItem {
  id: string;
  productName: string;
  expiryDate: string;
  quantity: number;
  unit: string;
  status: 'expired';
}

export interface ShortExpiryItem {
  id: string;
  productName: string;
  expiryDate: string;
  remainingDays: number;
  quantity: number;
  unit: string;
}

export interface LongUnsoldItem {
  id: string;
  productName: string;
  daysSinceLastSale: number | string;
  stockQty: number;
  unit: string;
  price: number;
  suggestedAction: 'discount' | 'combo';
}

export interface TopSellingItem {
  id: string;
  productName: string;
  soldQuantity: number;
  unit: string;
  revenue: number;
  remainingQuantity: number;
  suggestedAction: 'boost' | 'trends';
}

// Re-export table types for convenience
export * from './table';