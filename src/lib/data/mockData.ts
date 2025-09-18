import { Product, InventorySummary, NavItem, OutOfStockItem, LowQuantityItem, ExpiredItem, ShortExpiryItem, LongUnsoldItem, TopSellingItem } from '../types';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Dettol Handwash',
    category: 'Personal Care',
    buyingPrice: 120,
    stockQuantity: 42,
    lastSoldDate: '22 June 2026',
    expiryDate: '11 August 2026',
    availabilityStatus: 'in-stock'
  },
  {
    id: '2',
    name: 'Aashirvaad Atta 5kg',
    category: 'Grocery',
    buyingPrice: 250,
    stockQuantity: 42,
    lastSoldDate: '22 June 2026',
    expiryDate: '11 August 2026',
    availabilityStatus: 'in-stock'
  },
  {
    id: '3',
    name: 'Amul Butter 500g',
    category: 'Dairy',
    buyingPrice: 30,
    stockQuantity: 42,
    lastSoldDate: '22 June 2026',
    expiryDate: '11 August 2026',
    availabilityStatus: 'out-of-stock'
  },
  {
    id: '4',
    name: 'Maggi Noodles',
    category: 'Grocery',
    buyingPrice: 15,
    stockQuantity: 25,
    lastSoldDate: '20 June 2026',
    expiryDate: '15 August 2026',
    availabilityStatus: 'in-stock'
  },
  {
    id: '5',
    name: 'Colgate Toothpaste',
    category: 'Personal Care',
    buyingPrice: 80,
    stockQuantity: 0,
    lastSoldDate: '18 June 2026',
    expiryDate: '20 August 2026',
    availabilityStatus: 'out-of-stock'
  },
  {
    id: '6',
    name: 'Milk 1L',
    category: 'Dairy',
    buyingPrice: 60,
    stockQuantity: 15,
    lastSoldDate: '21 June 2026',
    expiryDate: '25 June 2026',
    availabilityStatus: 'in-stock'
  },
  {
    id: '7',
    name: 'Rice 5kg',
    category: 'Grocery',
    buyingPrice: 300,
    stockQuantity: 8,
    lastSoldDate: '19 June 2026',
    expiryDate: '30 August 2026',
    availabilityStatus: 'in-stock'
  },
  {
    id: '8',
    name: 'Shampoo',
    category: 'Personal Care',
    buyingPrice: 200,
    stockQuantity: 12,
    lastSoldDate: '17 June 2026',
    expiryDate: '10 September 2026',
    availabilityStatus: 'in-stock'
  },
  {
    id: '9',
    name: 'Bread',
    category: 'Grocery',
    buyingPrice: 25,
    stockQuantity: 0,
    lastSoldDate: '16 June 2026',
    expiryDate: '22 June 2026',
    availabilityStatus: 'out-of-stock'
  },
  {
    id: '10',
    name: 'Butter',
    category: 'Dairy',
    buyingPrice: 25,
    stockQuantity: 10,
    lastSoldDate: '16 June 2026',
    expiryDate: '22 June 2026',
    availabilityStatus: 'in-stock'
  },
  {
    id: '11',
    name: 'Paneer',
    category: 'Dairy',
    buyingPrice: 150,
    stockQuantity: 0,
    lastSoldDate: '21 June 2026',
    expiryDate: '25 June 2026',
    availabilityStatus: 'out-of-stock'
  }
];

// Mock Inventory Summary Data
export const mockInventorySummary: InventorySummary = {
  totalCategories: 14,
  inventoryValue: 250000,
  revenueGenerated: 180000,
  trends: {
    totalCategories: { value: 14, percentage: 16 },
    inventoryValue: { value: 250000, percentage: 16 },
    revenueGenerated: { value: 180000, percentage: 16 }
  }
};

// Navigation Items
export const navigationItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    href: '/dashboard'
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: 'ShoppingCart',
    href: '/inventory',
    hasDropdown: true,
    subItems: [
      {
        id: 'out-of-stock',
        label: 'Out of stock',
        href: '/inventory/out-of-stock'
      },
      {
        id: 'low-quantity-stock',
        label: 'Low quantity stock',
        href: '/inventory/low-quantity-stock'
      },
      {
        id: 'expired-stock',
        label: 'Expired stock',
        href: '/inventory/expired-stock'
      },
      {
        id: 'short-expiry-stock',
        label: 'Short expiry stock',
        href: '/inventory/short-expiry-stock'
      },
      {
        id: 'long-unsold-stock',
        label: 'Long unsold stock',
        href: '/inventory/long-unsold-stock'
      },
      {
        id: 'top-selling-stock',
        label: 'Top selling stock',
        href: '/inventory/top-selling-stock'
      }
    ]
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: 'List',
    href: '/orders'
  },
  {
    id: 'customers',
    label: 'Customers',
    icon: 'Users',
    href: '/customers'
  },
  {
    id: 'auto-reorders',
    label: 'Auto-Reorders',
    icon: 'RotateCcw',
    href: '/auto-reorders'
  },
  {
    id: 'offers-banners',
    label: 'Offers & Banners',
    icon: 'Tag',
    href: '/offers-banners'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: 'BarChart3',
    href: '/analytics'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'Settings',
    href: '/settings'
  },
  {
    id: 'admins',
    label: 'Admins',
    icon: 'UserCheck',
    href: '/admins'
  },
  {
    id: 'support',
    label: 'Support',
    icon: 'Headphones',
    href: '/support'
  }
];

// Categories for dropdown
export const categories = [
  'All Categories',
  'Personal Care',
  'Grocery',
  'Dairy',
  'Electronics',
  'Clothing',
  'Home & Garden',
  'Sports',
  'Books',
  'Toys',
  'Automotive',
  'Health',
  'Beauty',
  'Food & Beverages'
];

// Out of Stock Items Data
export const outOfStockItems: OutOfStockItem[] = [
  {
    id: '1',
    productName: 'Parle-G Biscuit 1kg',
    category: 'Snacks & Bakery',
    lastStockDate: '22 June 2026',
    supplierName: 'Parle Distributor'
  },
  {
    id: '2',
    productName: 'Surf Excel 1kg',
    category: 'Home Essentials',
    lastStockDate: '22 June 2026',
    supplierName: 'HUL Supplies'
  },
  {
    id: '3',
    productName: 'Amul Milk 1L',
    category: 'Dairy',
    lastStockDate: '22 June 2026',
    supplierName: 'Amul India Ltd.'
  },
  {
    id: '4',
    productName: 'Parle-G Biscuit 1kg',
    category: 'Personal Care',
    lastStockDate: '22 June 2026',
    supplierName: 'Parle Distributor'
  },
  {
    id: '5',
    productName: 'Surf Excel 1kg',
    category: 'Grocery',
    lastStockDate: '22 June 2026',
    supplierName: 'HUL Supplies'
  },
  {
    id: '6',
    productName: 'Amul Milk 1L',
    category: 'Dairy',
    lastStockDate: '11 August 2026',
    supplierName: 'Amul India Ltd.'
  },
  {
    id: '7',
    productName: 'Parle-G Biscuit 1kg',
    category: 'Personal Care',
    lastStockDate: '22 June 2026',
    supplierName: 'Parle Distributor'
  },
  {
    id: '8',
    productName: 'Surf Excel 1kg',
    category: 'Grocery',
    lastStockDate: '22 June 2026',
    supplierName: 'HUL Supplies'
  },
  {
    id: '9',
    productName: 'Amul Milk 1L',
    category: 'Dairy',
    lastStockDate: '22 June 2026',
    supplierName: 'Amul India Ltd.'
  }
];

// Low Quantity Items Data
export const lowQuantityItems: LowQuantityItem[] = [
  {
    id: '1',
    productName: 'Tata Salt 1kg',
    availableQuantity: 6,
    thresholdLevel: 10,
    supplierName: 'Tata Consumer Ltd.',
    unit: 'Packet'
  },
  {
    id: '2',
    productName: 'Lux Soap (Pack of 4)',
    availableQuantity: 3,
    thresholdLevel: 10,
    supplierName: 'HUL Supplies',
    unit: 'Packet'
  },
  {
    id: '3',
    productName: 'Aashirvaad Atta 5kg',
    availableQuantity: 13,
    thresholdLevel: 15,
    supplierName: 'ITC Wholesalers',
    unit: 'Packet'
  },
  {
    id: '4',
    productName: 'Tata Salt 1kg',
    availableQuantity: 8,
    thresholdLevel: 10,
    supplierName: 'Tata Consumer Ltd.',
    unit: 'Packet'
  },
  {
    id: '5',
    productName: 'Lux Soap (Pack of 4)',
    availableQuantity: 5,
    thresholdLevel: 10,
    supplierName: 'HUL Supplies',
    unit: 'Packet'
  },
  {
    id: '6',
    productName: 'Aashirvaad Atta 5kg',
    availableQuantity: 12,
    thresholdLevel: 15,
    supplierName: 'ITC Wholesalers',
    unit: 'Packet'
  },
  {
    id: '7',
    productName: 'Tata Salt 1kg',
    availableQuantity: 4,
    thresholdLevel: 10,
    supplierName: 'Tata Consumer Ltd.',
    unit: 'Packet'
  },
  {
    id: '8',
    productName: 'Lux Soap (Pack of 4)',
    availableQuantity: 7,
    thresholdLevel: 10,
    supplierName: 'HUL Supplies',
    unit: 'Packet'
  },
  {
    id: '9',
    productName: 'Aashirvaad Atta 5kg',
    availableQuantity: 9,
    thresholdLevel: 15,
    supplierName: 'ITC Wholesalers',
    unit: 'Packet'
  }
];

// Expired Items Data
export const expiredItems: ExpiredItem[] = [
  {
    id: '1',
    productName: 'Amul Butter 500g',
    expiryDate: '15 Jul 2025',
    quantity: 12,
    unit: 'Units',
    status: 'expired'
  },
  {
    id: '2',
    productName: 'Parle-G Biscuits',
    expiryDate: '12 Jul 2025',
    quantity: 20,
    unit: 'Packs',
    status: 'expired'
  },
  {
    id: '3',
    productName: 'Dabur Honey 250ml',
    expiryDate: '10 Jul 2025',
    quantity: 5,
    unit: 'Bottles',
    status: 'expired'
  },
  {
    id: '4',
    productName: 'Tata Salt 1kg',
    expiryDate: '08 Jul 2025',
    quantity: 8,
    unit: 'Packets',
    status: 'expired'
  },
  {
    id: '5',
    productName: 'Lux Soap (Pack of 4)',
    expiryDate: '05 Jul 2025',
    quantity: 15,
    unit: 'Packs',
    status: 'expired'
  },
  {
    id: '6',
    productName: 'Aashirvaad Atta 5kg',
    expiryDate: '03 Jul 2025',
    quantity: 3,
    unit: 'Packets',
    status: 'expired'
  },
  {
    id: '7',
    productName: 'Amul Butter 500g',
    expiryDate: '01 Jul 2025',
    quantity: 7,
    unit: 'Units',
    status: 'expired'
  },
  {
    id: '8',
    productName: 'Parle-G Biscuits',
    expiryDate: '28 Jun 2025',
    quantity: 25,
    unit: 'Packs',
    status: 'expired'
  },
  {
    id: '9',
    productName: 'Dabur Honey 250ml',
    expiryDate: '25 Jun 2025',
    quantity: 4,
    unit: 'Bottles',
    status: 'expired'
  }
];

// Short Expiry Items Data
export const shortExpiryItems: ShortExpiryItem[] = [
  {
    id: '1',
    productName: 'Amul Cheese Slices',
    expiryDate: '18 Aug 2025',
    remainingDays: 28,
    quantity: 22,
    unit: 'Packs'
  },
  {
    id: '2',
    productName: 'Real Mango Juice',
    expiryDate: '10 Aug 2025',
    remainingDays: 20,
    quantity: 18,
    unit: 'Bottles'
  },
  {
    id: '3',
    productName: 'Harvest Bread Loaf',
    expiryDate: '25 Jul 2025',
    remainingDays: 4,
    quantity: 12,
    unit: 'Units'
  },
  {
    id: '4',
    productName: 'Amul Cheese Slices',
    expiryDate: '15 Aug 2025',
    remainingDays: 25,
    quantity: 15,
    unit: 'Packs'
  },
  {
    id: '5',
    productName: 'Real Mango Juice',
    expiryDate: '12 Aug 2025',
    remainingDays: 22,
    quantity: 20,
    unit: 'Bottles'
  },
  {
    id: '6',
    productName: 'Harvest Bread Loaf',
    expiryDate: '28 Jul 2025',
    remainingDays: 7,
    quantity: 8,
    unit: 'Units'
  },
  {
    id: '7',
    productName: 'Amul Cheese Slices',
    expiryDate: '20 Aug 2025',
    remainingDays: 30,
    quantity: 25,
    unit: 'Packs'
  },
  {
    id: '8',
    productName: 'Real Mango Juice',
    expiryDate: '08 Aug 2025',
    remainingDays: 18,
    quantity: 16,
    unit: 'Bottles'
  },
  {
    id: '9',
    productName: 'Harvest Bread Loaf',
    expiryDate: '30 Jul 2025',
    remainingDays: 9,
    quantity: 10,
    unit: 'Units'
  }
];

// Long Unsold Items Data
export const longUnsoldItems: LongUnsoldItem[] = [
  {
    id: '1',
    productName: 'Patanjali Dant Kanti',
    daysSinceLastSale: 75,
    stockQty: 32,
    unit: 'Units',
    price: 45,
    suggestedAction: 'discount'
  },
  {
    id: '2',
    productName: 'Kellogg\'s Chocos',
    daysSinceLastSale: 92,
    stockQty: 15,
    unit: 'Boxes',
    price: 155,
    suggestedAction: 'combo'
  },
  {
    id: '3',
    productName: 'Vim Dish Gel',
    daysSinceLastSale: 68,
    stockQty: 40,
    unit: 'Bottles',
    price: 99,
    suggestedAction: 'discount'
  },
  {
    id: '4',
    productName: 'Amul Cheese Slices',
    daysSinceLastSale: '18 Aug 2025',
    stockQty: 22,
    unit: 'Packs',
    price: 85,
    suggestedAction: 'combo'
  },
  {
    id: '5',
    productName: 'Real Mango Juice',
    daysSinceLastSale: '10 Aug 2025',
    stockQty: 18,
    unit: 'Bottles',
    price: 65,
    suggestedAction: 'discount'
  },
  {
    id: '6',
    productName: 'Harvest Bread Loaf',
    daysSinceLastSale: '25 Jul 2025',
    stockQty: 12,
    unit: 'Units',
    price: 35,
    suggestedAction: 'combo'
  },
  {
    id: '7',
    productName: 'Tata Tea Gold',
    daysSinceLastSale: 85,
    stockQty: 25,
    unit: 'Packs',
    price: 120,
    suggestedAction: 'discount'
  },
  {
    id: '8',
    productName: 'Dabur Honey',
    daysSinceLastSale: 78,
    stockQty: 8,
    unit: 'Bottles',
    price: 180,
    suggestedAction: 'combo'
  },
  {
    id: '9',
    productName: 'Britannia Biscuits',
    daysSinceLastSale: 95,
    stockQty: 30,
    unit: 'Packs',
    price: 55,
    suggestedAction: 'discount'
  }
];

// Top Selling Items Data
export const topSellingItems: TopSellingItem[] = [
  {
    id: '1',
    productName: 'Amul Milk 1L',
    soldQuantity: 1250,
    unit: 'Units',
    revenue: 93750,
    remainingQuantity: 120,
    suggestedAction: 'boost'
  },
  {
    id: '2',
    productName: 'Tata Salt 1kg',
    soldQuantity: 920,
    unit: 'Units',
    revenue: 36800,
    remainingQuantity: 85,
    suggestedAction: 'trends'
  },
  {
    id: '3',
    productName: 'Aashirvaad Atta 5kg',
    soldQuantity: 870,
    unit: 'Units',
    revenue: 195750,
    remainingQuantity: 40,
    suggestedAction: 'boost'
  },
  {
    id: '4',
    productName: 'Parle-G Biscuits',
    soldQuantity: 750,
    unit: 'Packs',
    revenue: 11250,
    remainingQuantity: 95,
    suggestedAction: 'trends'
  },
  {
    id: '5',
    productName: 'Maggi Noodles',
    soldQuantity: 680,
    unit: 'Packs',
    revenue: 10200,
    remainingQuantity: 60,
    suggestedAction: 'boost'
  },
  {
    id: '6',
    productName: 'Colgate Toothpaste',
    soldQuantity: 520,
    unit: 'Units',
    revenue: 41600,
    remainingQuantity: 45,
    suggestedAction: 'trends'
  },
  {
    id: '7',
    productName: 'Surf Excel 1kg',
    soldQuantity: 480,
    unit: 'Units',
    revenue: 38400,
    remainingQuantity: 35,
    suggestedAction: 'boost'
  },
  {
    id: '8',
    productName: 'Dettol Handwash',
    soldQuantity: 420,
    unit: 'Units',
    revenue: 50400,
    remainingQuantity: 50,
    suggestedAction: 'trends'
  },
  {
    id: '9',
    productName: 'Lux Soap',
    soldQuantity: 380,
    unit: 'Units',
    revenue: 19000,
    remainingQuantity: 25,
    suggestedAction: 'boost'
  }
];
