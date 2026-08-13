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

export interface LowStockItem {
  productId: string;
  name: string;
  currentStock: number;
  type: "product" | "combo";
  status: "ACTIVE" | "OUT_OF_STOCK" | "DISCONTINUED";
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
  storeName?: string;
  phone: string;
  email: string;
  customerId: string;
  totalSpend: number;
  loyaltyTier: "None" | "Bronze" | "Silver" | "Gold" | "Titanium" | "Platinum" | "Diamond" | "Kohinoor";
  lastOrder: string;
  lastOrderId?: string | null;
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

export interface OrderUpdateHistory {
  status: string;
  updatedAt: string;
  /** Role that made the change: USER, ADMIN or SYSTEM. */
  updatedBy: string;
  /** Who made the change. Absent on entries recorded before actor tracking. */
  updatedByName?: string;
  updatedByUser?: string;
  reason?: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderId: string;
  amount: number;
  customer: string;
  customerFirstName?: string;
  customerLastName?: string;
  customerStoreName?: string;
  status: "Delivered" | "Pending" | "Processing" | "Shipped" | "Cancelled" | "Refunded" | "Returned";
  payment: "UPI" | "COD" | "Card" | "Net Banking";
  deliveryDate: string;
  orderDate: string;
  items: {
    productName: string;
    title2?: string;
    title3?: string;
    title4?: string;
    quantity: number;
    price: number;
    productId?: string;
    productType?: "product" | "combo";
    discountApplied?: number;
  }[];
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
    country?: string;
    type?: string;
    latitude?: number;
    longitude?: number;
  };
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
    country?: string;
    type?: string;
    latitude?: number;
    longitude?: number;
  };
  trackingNumber?: string;
  orderNotes?: string;
  updateHistory?: OrderUpdateHistory[];
  paymentDetails?: {
    method: string;
    transactionId?: string;
    status?: string;
    amount?: number;
  };
  deliverySlot?: {
    date: string;
    timeWindow?: string;
  };
  /** Order breakdown: items total before shipping/discounts */
  itemsTotal?: number;
  /** Delivery fee; 0 when free */
  shippingCharges?: number;
  /** Discount from applied coupon */
  couponDiscount?: number;
  /** Applied coupon code when discount was used */
  couponCode?: string;
  /** Loyalty tier discount percentage applied */
  loyaltyDiscountPercent?: number;
  /** Loyalty tier discount amount (₹) */
  loyaltyDiscountAmount?: number;
  /** True when order was created via POS (point-of-sale) */
  walkin?: boolean;
  /** Customer name for walk-in / POS orders (when no registered customer) */
  walkinCustomerName?: string;
  /** Cashier name for POS orders (from createdByCashier: string snapshot or populated user) */
  cashierName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderSummary {
  totalOrders: number;
  totalReceived: number;
  totalReturned: number;
  onTheWay: number;
  revenue: number;
  returnAmount: number;
  onTheWayCost: number;
  /** Count and value per order status; absent on older API responses. */
  statusBreakdown?: Record<string, { count: number; amount: number }>;
  totalCancelled?: number;
  totalDelivered?: number;
  totalPending?: number;
  totalUPIOrders?: number;
  totalCODOrders?: number;
  totalCardOrders?: number;
  period?: string;
  /** Time series backing the trend charts; absent on older API responses. */
  trend?: {
    granularity: 'hour' | 'day' | 'month';
    points: Array<{ date: string; orders: number; revenue: number }>;
  };
  /** Deliveries keyed on when they were marked delivered, not when placed. */
  deliveredTrend?: {
    granularity: 'hour' | 'day' | 'month';
    points: Array<{ date: string; delivered: number; revenue: number }>;
  };
  /** Previous equal-length window, backing the "vs previous" deltas. */
  comparison?: {
    totalOrders: number;
    revenue: number;
    ordersGrowth: number | null;
    revenueGrowth: number | null;
  };
  trends: {
    totalOrders: { value: number; percentage: number };
    totalReceived: { value: number; percentage: number };
    totalReturned: { value: number; percentage: number };
    onTheWay: { value: number; percentage: number };
  };
}

export interface Address {
  type: "HOME" | "WORK" | "OTHER" | "STORE";
  addressLine: string;
  landmark?: string; // Optional as per API
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}
