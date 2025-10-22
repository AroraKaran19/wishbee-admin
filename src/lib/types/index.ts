export * from "./product";
export * from "./table";
export * from "./category";
export * from "./discount";
export * from "./reviews";
export * from "./user";
export * from "./order";
export * from "./combo";
export * from "./enquiry";

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
  status: "expired";
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
  suggestedAction: "discount" | "combo";
}

export interface TopSellingItem {
  id: string;
  productName: string;
  soldQuantity: number;
  unit: string;
  revenue: number;
  remainingQuantity: number;
  suggestedAction: "boost" | "trends";
}

export interface ProductDetail {
  id: string;
  productName: string;
  productDescription: string;
  productId: string;
  buyingPrice: number;
  productCategory: string;
  expiryDate: string;
  quantity: number;
  thresholdValue: number;
  supplier: {
    name: string;
    contactNumber: string;
  };
  stockLocations: {
    storeName: string;
    stockInHand: number;
  }[];
  images: string[];
  stockOverview: {
    openingStock: number;
    remainingStock: number;
    onTheWay: number;
    thresholdValue: number;
  };
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  customerId: string;
  totalSpend: number;
  loyaltyTier: "Bronze" | "Silver" | "Gold" | "Platinum";
  lastOrder: string;
  status: "Active" | "Inactive" | "Suspended";
  registrationDate: string;
  totalOrders: number;
  averageOrderValue: number;
  preferredCategories: string[];
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export interface Order {
  id: string;
  orderId: string;
  amount: number;
  customer: string;
  status: "Delivered" | "Pending" | "Processing" | "Shipped" | "Cancelled";
  payment: "UPI" | "COD" | "Card" | "Net Banking";
  deliveryDate: string;
  orderDate: string;
  items: {
    productName: string;
    quantity: number;
    price: number;
  }[];
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  trackingNumber?: string;
}

export interface OrderSummary {
  totalOrders: number;
  totalReceived: number;
  totalReturned: number;
  onTheWay: number;
  revenue: number;
  returnAmount: number;
  onTheWayCost: number;
  trends: {
    totalOrders: { value: number; percentage: number };
    totalReceived: { value: number; percentage: number };
    totalReturned: { value: number; percentage: number };
    onTheWay: { value: number; percentage: number };
  };
}

export interface Address {
  type: "HOME" | "WORK" | "OTHER";
  addressLine: string;
  landmark: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}
