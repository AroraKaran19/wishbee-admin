import { Product, InventorySummary, NavItem, OutOfStockItem, LowQuantityItem } from '../types';

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
        id: 'most-sold-stock',
        label: 'Most sold stock',
        href: '/inventory/most-sold-stock'
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
