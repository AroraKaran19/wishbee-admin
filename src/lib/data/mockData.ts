import { Product, InventorySummary, NavItem, OutOfStockItem, LowQuantityItem, ExpiredItem, ShortExpiryItem, LongUnsoldItem, TopSellingItem, ProductDetail, Customer, Order, OrderSummary } from '../types';

export const mockProducts: Product[] = [
  {
    _id: '1',
    sku: 'DET001',
    name: 'Dettol Handwash',
    description: 'Antibacterial handwash for effective hand hygiene',
    highlights: ['Kills 99.9% germs', 'Moisturizing formula', 'Dermatologically tested'],
    categoryId: "12345678" as any,
    subCategory: "12345678" as any,
    images: ['/images/dettol-handwash-1.jpg', '/images/dettol-handwash-2.jpg'],
    status: "ACTIVE",
    isOrganic: false,
    price: {
      single: 120,
      bulk: 100
    },
    multiQuantity: [
      { value: 3, discount: 'percentage', discountValue: 10 },
      { value: 6, discount: 'fixed', discountValue: 50 }
    ],
    reviews: [],
    discount: {
      type: 'percentage',
      value: 15
    },
    minimumOrderQuantity: 1,
    maximumOrderQuantity: 100,
    stock: 42,
    weight: {
      single: { value: 200, unit: 'ml' },
      bulk: { value: 1000, unit: 'ml' }
    },
    reviewsCount: 0,
    totalRating: 0,
    metaTitle: 'Dettol Handwash - Antibacterial Hand Hygiene',
    metaDescription: 'Buy Dettol Handwash online. Kills 99.9% germs with moisturizing formula.',
    metaKeywords: ['handwash', 'dettol', 'antibacterial', 'hygiene'],
    slug: 'dettol-handwash',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-06-22')
  },
  {
    _id: 'top-2',
    sku: 'AAS001',
    name: 'Aashirvaad Atta 5kg',
    description: 'Premium whole wheat flour for healthy rotis and breads',
    highlights: ['100% whole wheat', 'No preservatives', 'Rich in fiber'],
    categoryId: "12345678" as any,
    subCategory: "12345678" as any,
    images: ['/images/aashirvaad-atta-1.jpg'],
    status: "ACTIVE",
    isOrganic: false,
    price: {
      single: 250,
      bulk: 220
    },
    multiQuantity: [
      { value: 2, discount: 'percentage', discountValue: 5 }
    ],
    reviews: [],
    discount: {
      type: 'percentage',
      value: 10
    },
    minimumOrderQuantity: 1,
    maximumOrderQuantity: 50,
    stock: 42,
    weight: {
      single: { value: 5, unit: 'kg' },
      bulk: { value: 10, unit: 'kg' }
    },
    reviewsCount: 0,
    totalRating: 0,
    metaTitle: 'Aashirvaad Atta 5kg - Premium Whole Wheat Flour',
    metaDescription: 'Buy Aashirvaad Atta 5kg online. 100% whole wheat flour for healthy cooking.',
    metaKeywords: ['atta', 'wheat flour', 'aashirvaad', 'whole wheat'],
    slug: 'aashirvaad-atta-5kg',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-06-22')
  },
  {
    _id: 'long-3',
    sku: 'AMU001',
    name: 'Amul Butter 500g',
    description: 'Pure and fresh butter made from cow\'s milk',
    highlights: ['Pure cow\'s milk', 'No preservatives', 'Rich taste'],
    categoryId: "12345678" as any,
    subCategory: "12345678" as any,
    images: ['/images/amul-butter-1.jpg'],
    status: "OUT_OF_STOCK",
    isOrganic: false,
    price: {
      single: 30,
      bulk: 25
    },
    reviews: [],
    discount: {
      type: 'percentage',
      value: 0
    },
    minimumOrderQuantity: 1,
    maximumOrderQuantity: 20,
    stock: 0,
    weight: {
      single: { value: 500, unit: 'g' },
      bulk: { value: 1000, unit: 'g' }
    },
    reviewsCount: 0,
    totalRating: 0,
    metaTitle: 'Amul Butter 500g - Pure Cow\'s Milk Butter',
    metaDescription: 'Buy Amul Butter 500g online. Pure and fresh butter made from cow\'s milk.',
    metaKeywords: ['butter', 'amul', 'cow milk', 'dairy'],
    slug: 'amul-butter-500g',
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-06-22')
  },
  {
    _id: 'out-4',
    sku: 'MAG001',
    name: 'Maggi Noodles',
    description: 'Instant noodles ready in 2 minutes',
    highlights: ['Ready in 2 minutes', 'Tasty masala', 'No preservatives'],
    categoryId: "12345678" as any,
    subCategory: "12345678" as any,
    images: ['/images/maggi-noodles-1.jpg'],
    status: "ACTIVE",
    isOrganic: false,
    price: {
      single: 15,
      bulk: 12
    },
    multiQuantity: [
      { value: 5, discount: 'fixed', discountValue: 10 }
    ],
    reviews: [],
    discount: {
      type: 'percentage',
      value: 5
    },
    minimumOrderQuantity: 1,
    maximumOrderQuantity: 200,
    stock: 25,
    weight: {
      single: { value: 70, unit: 'g' },
      bulk: { value: 350, unit: 'g' }
    },
    reviewsCount: 0,
    totalRating: 0,
    metaTitle: 'Maggi Noodles - Instant 2-Minute Noodles',
    metaDescription: 'Buy Maggi Noodles online. Ready in 2 minutes with tasty masala.',
    metaKeywords: ['noodles', 'maggi', 'instant', 'ready to eat'],
    slug: 'maggi-noodles',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-06-20')
  },
  {
    _id: 'short-5',
    sku: 'COL001',
    name: 'Colgate Toothpaste',
    description: 'Complete protection toothpaste for healthy teeth and gums',
    highlights: ['Complete protection', 'Fresh breath', 'Fluoride protection'],
    categoryId: "12345678" as any,
    subCategory: "12345678" as any,
    images: ['/images/colgate-toothpaste-1.jpg'],
    status: "OUT_OF_STOCK",
    isOrganic: false,
    price: {
      single: 80,
      bulk: 70
    },
    reviews: [],
    discount: {
      type: 'percentage',
      value: 8
    },
    minimumOrderQuantity: 1,
    maximumOrderQuantity: 50,
    stock: 0,
    weight: {
      single: { value: 150, unit: 'g' },
      bulk: { value: 300, unit: 'g' }
    },
    reviewsCount: 0,
    totalRating: 0,
    metaTitle: 'Colgate Toothpaste - Complete Protection',
    metaDescription: 'Buy Colgate Toothpaste online. Complete protection for healthy teeth and gums.',
    metaKeywords: ['toothpaste', 'colgate', 'dental care', 'oral hygiene'],
    slug: 'colgate-toothpaste',
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-06-18')
  },
  {
    _id: 'short-6',
    sku: 'MIL001',
    name: 'Milk 1L',
    description: 'Fresh cow\'s milk, pasteurized and homogenized',
    highlights: ['Fresh cow\'s milk', 'Pasteurized', 'Rich in calcium'],
    categoryId: "12345678" as any,
    subCategory: "12345678" as any,
    images: ['/images/milk-1l-1.jpg'],
    status: "ACTIVE",
    isOrganic: false,
    price: {
      single: 60,
      bulk: 55
    },
    reviews: [],
    discount: {
      type: 'percentage',
      value: 0
    },
    minimumOrderQuantity: 1,
    maximumOrderQuantity: 10,
    stock: 15,
    weight: {
      single: { value: 1, unit: 'L' },
      bulk: { value: 2, unit: 'L' }
    },
    reviewsCount: 0,
    totalRating: 0,
    metaTitle: 'Fresh Milk 1L - Pasteurized Cow\'s Milk',
    metaDescription: 'Buy fresh milk 1L online. Pasteurized and homogenized cow\'s milk.',
    metaKeywords: ['milk', 'fresh', 'cow milk', 'dairy', 'pasteurized'],
    slug: 'milk-1l',
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-06-21')
  },
  {
    _id: 'short-7',
    sku: 'RIC001',
    name: 'Rice 5kg',
    description: 'Premium basmati rice, long grain and aromatic',
    highlights: ['Premium basmati', 'Long grain', 'Aromatic'],
    categoryId: "12345678" as any,
    subCategory: "12345678" as any,
    images: ['/images/rice-5kg-1.jpg'],
    status: "ACTIVE",
    isOrganic: false,
    price: {
      single: 300,
      bulk: 280
    },
    multiQuantity: [
      { value: 2, discount: 'percentage', discountValue: 8 }
    ],
    reviews: [],
    discount: {
      type: 'percentage',
      value: 12
    },
    minimumOrderQuantity: 1,
    maximumOrderQuantity: 20,
    stock: 8,
    weight: {
      single: { value: 5, unit: 'kg' },
      bulk: { value: 10, unit: 'kg' }
    },
    reviewsCount: 0,
    totalRating: 0,
    metaTitle: 'Premium Basmati Rice 5kg - Long Grain Aromatic',
    metaDescription: 'Buy premium basmati rice 5kg online. Long grain and aromatic rice.',
    metaKeywords: ['rice', 'basmati', 'long grain', 'aromatic', 'premium'],
    slug: 'rice-5kg',
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-06-19')
  },
  {
    _id: 'short-8',
    sku: 'SHA001',
    name: 'Shampoo',
    description: 'Gentle cleansing shampoo for all hair types',
    highlights: ['Gentle cleansing', 'All hair types', 'Sulfate-free'],
    categoryId: "12345678" as any,
    subCategory: "12345678" as any,
    images: ['/images/shampoo-1.jpg'],
    status: "ACTIVE",
    isOrganic: false,
    price: {
      single: 200,
      bulk: 180
    },
    reviews: [],
    discount: {
      type: 'percentage',
      value: 10
    },
    minimumOrderQuantity: 1,
    maximumOrderQuantity: 30,
    stock: 12,
    weight: {
      single: { value: 400, unit: 'ml' },
      bulk: { value: 800, unit: 'ml' }
    },
    reviewsCount: 0,
    totalRating: 0,
    metaTitle: 'Gentle Shampoo - All Hair Types',
    metaDescription: 'Buy gentle shampoo online. Suitable for all hair types with sulfate-free formula.',
    metaKeywords: ['shampoo', 'hair care', 'gentle', 'sulfate-free'],
    slug: 'shampoo',
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-06-17')
  },
  {
    _id: 'short-9',
    sku: 'BRE001',
    name: 'Bread',
    description: 'Fresh white bread, soft and fluffy',
    highlights: ['Fresh baked', 'Soft and fluffy', 'No preservatives'],
    categoryId: "12345678" as any,
    subCategory: "12345678" as any,
    images: ['/images/bread-1.jpg'],
    status: "OUT_OF_STOCK",
    isOrganic: false,
    price: {
      single: 25,
      bulk: 22
    },
    reviews: [],
    discount: {
      type: 'percentage',
      value: 0
    },
    minimumOrderQuantity: 1,
    maximumOrderQuantity: 20,
    stock: 0,
    weight: {
      single: { value: 400, unit: 'g' },
      bulk: { value: 800, unit: 'g' }
    },
    reviewsCount: 0,
    totalRating: 0,
    metaTitle: 'Fresh White Bread - Soft and Fluffy',
    metaDescription: 'Buy fresh white bread online. Soft and fluffy bread with no preservatives.',
    metaKeywords: ['bread', 'white bread', 'fresh', 'bakery'],
    slug: 'bread',
    createdAt: new Date('2024-02-25'),
    updatedAt: new Date('2024-06-16')
  },
  {
    _id: '10',
    sku: 'BUT001',
    name: 'Butter',
    description: 'Creamy butter perfect for cooking and spreading',
    highlights: ['Creamy texture', 'Perfect for cooking', 'Rich taste'],
    categoryId: "12345678" as any,
    subCategory: "12345678" as any,
    images: ['/images/butter-1.jpg'],
    status: "ACTIVE",
    isOrganic: false,
    price: {
      single: 25,
      bulk: 22
    },
    reviews: [],
    discount: {
      type: 'percentage',
      value: 5
    },
    minimumOrderQuantity: 1,
    maximumOrderQuantity: 15,
    stock: 10,
    weight: {
      single: { value: 100, unit: 'g' },
      bulk: { value: 250, unit: 'g' }
    },
    reviewsCount: 0,
    totalRating: 0,
    metaTitle: 'Creamy Butter - Perfect for Cooking',
    metaDescription: 'Buy creamy butter online. Perfect for cooking and spreading with rich taste.',
    metaKeywords: ['butter', 'creamy', 'cooking', 'dairy'],
    slug: 'butter',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-06-16')
  },
  {
    _id: '11',
    sku: 'PAN001',
    name: 'Paneer',
    description: 'Fresh cottage cheese, soft and crumbly',
    highlights: ['Fresh cottage cheese', 'Soft texture', 'High protein'],
    categoryId: "12345678" as any,
    subCategory: "12345678" as any,
    images: ['/images/paneer-1.jpg'],
    status: "OUT_OF_STOCK",
    isOrganic: false,
    price: {
      single: 150,
      bulk: 140
    },
    reviews: [],
    discount: {
      type: 'percentage',
      value: 0
    },
    minimumOrderQuantity: 1,
    maximumOrderQuantity: 10,
    stock: 0,
    weight: {
      single: { value: 200, unit: 'g' },
      bulk: { value: 500, unit: 'g' }
    },
    reviewsCount: 0,
    totalRating: 0,
    metaTitle: 'Fresh Paneer - Soft Cottage Cheese',
    metaDescription: 'Buy fresh paneer online. Soft and crumbly cottage cheese with high protein.',
    metaKeywords: ['paneer', 'cottage cheese', 'fresh', 'protein', 'dairy'],
    slug: 'paneer',
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-06-21')
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
    id: 'out-1',
    productName: 'Parle-G Biscuit 1kg',
    category: 'Snacks & Bakery',
    lastStockDate: '22 June 2026',
    supplierName: 'Parle Distributor'
  },
  {
    id: 'out-2',
    productName: 'Surf Excel 1kg',
    category: 'Home Essentials',
    lastStockDate: '22 June 2026',
    supplierName: 'HUL Supplies'
  },
  {
    id: 'out-3',
    productName: 'Amul Milk 1L',
    category: 'Dairy',
    lastStockDate: '22 June 2026',
    supplierName: 'Amul India Ltd.'
  },
  {
    id: 'out-4',
    productName: 'Parle-G Biscuit 1kg',
    category: 'Personal Care',
    lastStockDate: '22 June 2026',
    supplierName: 'Parle Distributor'
  },
  {
    id: 'short-5',
    productName: 'Surf Excel 1kg',
    category: 'Grocery',
    lastStockDate: '22 June 2026',
    supplierName: 'HUL Supplies'
  },
  {
    id: 'short-6',
    productName: 'Amul Milk 1L',
    category: 'Dairy',
    lastStockDate: '11 August 2026',
    supplierName: 'Amul India Ltd.'
  },
  {
    id: 'short-7',
    productName: 'Parle-G Biscuit 1kg',
    category: 'Personal Care',
    lastStockDate: '22 June 2026',
    supplierName: 'Parle Distributor'
  },
  {
    id: 'short-8',
    productName: 'Surf Excel 1kg',
    category: 'Grocery',
    lastStockDate: '22 June 2026',
    supplierName: 'HUL Supplies'
  },
  {
    id: 'short-9',
    productName: 'Amul Milk 1L',
    category: 'Dairy',
    lastStockDate: '22 June 2026',
    supplierName: 'Amul India Ltd.'
  }
];

// Low Quantity Items Data
export const lowQuantityItems: LowQuantityItem[] = [
  {
    id: 'low-1',
    productName: 'Tata Salt 1kg',
    availableQuantity: 6,
    thresholdLevel: 10,
    supplierName: 'Tata Consumer Ltd.',
    unit: 'Packet'
  },
  {
    id: 'low-2',
    productName: 'Lux Soap (Pack of 4)',
    availableQuantity: 3,
    thresholdLevel: 10,
    supplierName: 'HUL Supplies',
    unit: 'Packet'
  },
  {
    id: 'low-3',
    productName: 'Aashirvaad Atta 5kg',
    availableQuantity: 13,
    thresholdLevel: 15,
    supplierName: 'ITC Wholesalers',
    unit: 'Packet'
  },
  {
    id: 'low-4',
    productName: 'Tata Salt 1kg',
    availableQuantity: 8,
    thresholdLevel: 10,
    supplierName: 'Tata Consumer Ltd.',
    unit: 'Packet'
  },
  {
    id: 'low-5',
    productName: 'Lux Soap (Pack of 4)',
    availableQuantity: 5,
    thresholdLevel: 10,
    supplierName: 'HUL Supplies',
    unit: 'Packet'
  },
  {
    id: 'low-6',
    productName: 'Aashirvaad Atta 5kg',
    availableQuantity: 12,
    thresholdLevel: 15,
    supplierName: 'ITC Wholesalers',
    unit: 'Packet'
  },
  {
    id: 'low-7',
    productName: 'Tata Salt 1kg',
    availableQuantity: 4,
    thresholdLevel: 10,
    supplierName: 'Tata Consumer Ltd.',
    unit: 'Packet'
  },
  {
    id: 'low-8',
    productName: 'Lux Soap (Pack of 4)',
    availableQuantity: 7,
    thresholdLevel: 10,
    supplierName: 'HUL Supplies',
    unit: 'Packet'
  },
  {
    id: 'low-9',
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
    id: 'exp-1',
    productName: 'Amul Butter 500g',
    expiryDate: '15 Jul 2025',
    quantity: 12,
    unit: 'Units',
    status: 'expired'
  },
  {
    id: 'exp-2',
    productName: 'Parle-G Biscuits',
    expiryDate: '12 Jul 2025',
    quantity: 20,
    unit: 'Packs',
    status: 'expired'
  },
  {
    id: 'exp-3',
    productName: 'Dabur Honey 250ml',
    expiryDate: '10 Jul 2025',
    quantity: 5,
    unit: 'Bottles',
    status: 'expired'
  },
  {
    id: 'exp-4',
    productName: 'Tata Salt 1kg',
    expiryDate: '08 Jul 2025',
    quantity: 8,
    unit: 'Packets',
    status: 'expired'
  },
  {
    id: 'exp-5',
    productName: 'Lux Soap (Pack of 4)',
    expiryDate: '05 Jul 2025',
    quantity: 15,
    unit: 'Packs',
    status: 'expired'
  },
  {
    id: 'exp-6',
    productName: 'Aashirvaad Atta 5kg',
    expiryDate: '03 Jul 2025',
    quantity: 3,
    unit: 'Packets',
    status: 'expired'
  },
  {
    id: 'exp-7',
    productName: 'Amul Butter 500g',
    expiryDate: '01 Jul 2025',
    quantity: 7,
    unit: 'Units',
    status: 'expired'
  },
  {
    id: 'exp-8',
    productName: 'Parle-G Biscuits',
    expiryDate: '28 Jun 2025',
    quantity: 25,
    unit: 'Packs',
    status: 'expired'
  },
  {
    id: 'exp-9',
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
    id: 'short-1',
    productName: 'Amul Cheese Slices',
    expiryDate: '18 Aug 2025',
    remainingDays: 28,
    quantity: 22,
    unit: 'Packs'
  },
  {
    id: 'short-2',
    productName: 'Real Mango Juice',
    expiryDate: '10 Aug 2025',
    remainingDays: 20,
    quantity: 18,
    unit: 'Bottles'
  },
  {
    id: 'short-3',
    productName: 'Harvest Bread Loaf',
    expiryDate: '25 Jul 2025',
    remainingDays: 4,
    quantity: 12,
    unit: 'Units'
  },
  {
    id: 'short-4',
    productName: 'Amul Cheese Slices',
    expiryDate: '15 Aug 2025',
    remainingDays: 25,
    quantity: 15,
    unit: 'Packs'
  },
  {
    id: 'short-5',
    productName: 'Real Mango Juice',
    expiryDate: '12 Aug 2025',
    remainingDays: 22,
    quantity: 20,
    unit: 'Bottles'
  },
  {
    id: 'short-6',
    productName: 'Harvest Bread Loaf',
    expiryDate: '28 Jul 2025',
    remainingDays: 7,
    quantity: 8,
    unit: 'Units'
  },
  {
    id: 'short-7',
    productName: 'Amul Cheese Slices',
    expiryDate: '20 Aug 2025',
    remainingDays: 30,
    quantity: 25,
    unit: 'Packs'
  },
  {
    id: 'short-8',
    productName: 'Real Mango Juice',
    expiryDate: '08 Aug 2025',
    remainingDays: 18,
    quantity: 16,
    unit: 'Bottles'
  },
  {
    id: 'short-9',
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
    id: 'long-1',
    productName: 'Patanjali Dant Kanti',
    daysSinceLastSale: 75,
    stockQty: 32,
    unit: 'Units',
    price: 45,
    suggestedAction: 'discount'
  },
  {
    id: 'long-2',
    productName: 'Kellogg\'s Chocos',
    daysSinceLastSale: 92,
    stockQty: 15,
    unit: 'Boxes',
    price: 155,
    suggestedAction: 'combo'
  },
  {
    id: 'long-3',
    productName: 'Vim Dish Gel',
    daysSinceLastSale: 68,
    stockQty: 40,
    unit: 'Bottles',
    price: 99,
    suggestedAction: 'discount'
  },
  {
    id: 'out-4',
    productName: 'Amul Cheese Slices',
    daysSinceLastSale: '18 Aug 2025',
    stockQty: 22,
    unit: 'Packs',
    price: 85,
    suggestedAction: 'combo'
  },
  {
    id: 'short-5',
    productName: 'Real Mango Juice',
    daysSinceLastSale: '10 Aug 2025',
    stockQty: 18,
    unit: 'Bottles',
    price: 65,
    suggestedAction: 'discount'
  },
  {
    id: 'short-6',
    productName: 'Harvest Bread Loaf',
    daysSinceLastSale: '25 Jul 2025',
    stockQty: 12,
    unit: 'Units',
    price: 35,
    suggestedAction: 'combo'
  },
  {
    id: 'short-7',
    productName: 'Tata Tea Gold',
    daysSinceLastSale: 85,
    stockQty: 25,
    unit: 'Packs',
    price: 120,
    suggestedAction: 'discount'
  },
  {
    id: 'short-8',
    productName: 'Dabur Honey',
    daysSinceLastSale: 78,
    stockQty: 8,
    unit: 'Bottles',
    price: 180,
    suggestedAction: 'combo'
  },
  {
    id: 'short-9',
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
    id: 'top-1',
    productName: 'Amul Milk 1L',
    soldQuantity: 1250,
    unit: 'Units',
    revenue: 93750,
    remainingQuantity: 120,
    suggestedAction: 'boost'
  },
  {
    id: 'top-2',
    productName: 'Tata Salt 1kg',
    soldQuantity: 920,
    unit: 'Units',
    revenue: 36800,
    remainingQuantity: 85,
    suggestedAction: 'trends'
  },
  {
    id: 'long-3',
    productName: 'Aashirvaad Atta 5kg',
    soldQuantity: 870,
    unit: 'Units',
    revenue: 195750,
    remainingQuantity: 40,
    suggestedAction: 'boost'
  },
  {
    id: 'out-4',
    productName: 'Parle-G Biscuits',
    soldQuantity: 750,
    unit: 'Packs',
    revenue: 11250,
    remainingQuantity: 95,
    suggestedAction: 'trends'
  },
  {
    id: 'short-5',
    productName: 'Maggi Noodles',
    soldQuantity: 680,
    unit: 'Packs',
    revenue: 10200,
    remainingQuantity: 60,
    suggestedAction: 'boost'
  },
  {
    id: 'short-6',
    productName: 'Colgate Toothpaste',
    soldQuantity: 520,
    unit: 'Units',
    revenue: 41600,
    remainingQuantity: 45,
    suggestedAction: 'trends'
  },
  {
    id: 'short-7',
    productName: 'Surf Excel 1kg',
    soldQuantity: 480,
    unit: 'Units',
    revenue: 38400,
    remainingQuantity: 35,
    suggestedAction: 'boost'
  },
  {
    id: 'short-8',
    productName: 'Dettol Handwash',
    soldQuantity: 420,
    unit: 'Units',
    revenue: 50400,
    remainingQuantity: 50,
    suggestedAction: 'trends'
  },
  {
    id: 'short-9',
    productName: 'Lux Soap',
    soldQuantity: 380,
    unit: 'Units',
    revenue: 19000,
    remainingQuantity: 25,
    suggestedAction: 'boost'
  }
];

// Product Details Data
export const productDetails: ProductDetail[] = [
  {
    id: '1',
    productName: 'Dettol handwash',
    productDescription: 'Dettol Liquid Handwash provides 99.9% germ protection while being gentle on the skin, leaving your hands clean, soft, and refreshed with every wash. Formulated with natural ingredients and antibacterial properties.',
    productId: '8899364',
    buyingPrice: 100,
    productCategory: 'Health and wellness',
    expiryDate: '18 August 2026',
    quantity: 56,
    thresholdValue: 12,
    supplier: {
      name: 'Aniket nayak',
      contactNumber: '+91 9792567876'
    },
    stockLocations: [
      { storeName: 'NSP masters', stockInHand: 12 },
      { storeName: 'NSP masters', stockInHand: 12 },
      { storeName: 'Central Store', stockInHand: 8 },
      { storeName: 'Branch Store A', stockInHand: 6 }
    ],
    images: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&crop=center'
    ],
    stockOverview: {
      openingStock: 56,
      remainingStock: 24,
      onTheWay: 8,
      thresholdValue: 12
    }
  },
  {
    id: 'top-2',
    productName: 'Aashirvaad Atta 5kg',
    productDescription: 'Aashirvaad Atta is made from the finest quality wheat grains, carefully selected and processed to ensure the perfect texture and taste for your daily rotis and parathas.',
    productId: '8899365',
    buyingPrice: 250,
    productCategory: 'Grocery',
    expiryDate: '15 September 2026',
    quantity: 42,
    thresholdValue: 15,
    supplier: {
      name: 'ITC Wholesalers',
      contactNumber: '+91 9876543210'
    },
    stockLocations: [
      { storeName: 'Main Store', stockInHand: 25 },
      { storeName: 'Branch Store', stockInHand: 17 },
      { storeName: 'Warehouse A', stockInHand: 10 },
      { storeName: 'Retail Outlet', stockInHand: 5 }
    ],
    images: [
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop&crop=center'
    ],
    stockOverview: {
      openingStock: 42,
      remainingStock: 30,
      onTheWay: 5,
      thresholdValue: 15
    }
  },
  {
    id: 'long-3',
    productName: 'Amul Butter 500g',
    productDescription: 'Amul Butter is made from fresh cream and is rich in taste. Perfect for spreading on bread, toast, and for cooking delicious meals.',
    productId: '8899366',
    buyingPrice: 30,
    productCategory: 'Dairy',
    expiryDate: '20 July 2026',
    quantity: 0,
    thresholdValue: 10,
    supplier: {
      name: 'Amul India Ltd.',
      contactNumber: '+91 9123456789'
    },
    stockLocations: [
      { storeName: 'Main Store', stockInHand: 0 },
      { storeName: 'Branch Store', stockInHand: 0 },
      { storeName: 'Warehouse B', stockInHand: 0 }
    ],
    images: [
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center'
    ],
    stockOverview: {
      openingStock: 0,
      remainingStock: 0,
      onTheWay: 20,
      thresholdValue: 10
    }
  },
  {
    id: 'out-4',
    productName: 'Parle-G Biscuit 1kg',
    productDescription: 'Parle-G biscuits are made with the finest ingredients and provide energy and nutrition. Perfect for breakfast, snacks, or anytime hunger strikes.',
    productId: '8899367',
    buyingPrice: 45,
    productCategory: 'Snacks & Bakery',
    expiryDate: '15 September 2026',
    quantity: 120,
    thresholdValue: 20,
    supplier: {
      name: 'Parle Products Ltd.',
      contactNumber: '+91 9876543210'
    },
    stockLocations: [
      { storeName: 'Main Store', stockInHand: 50 },
      { storeName: 'Branch Store A', stockInHand: 35 },
      { storeName: 'Branch Store B', stockInHand: 25 },
      { storeName: 'Warehouse', stockInHand: 10 }
    ],
    images: [
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center'
    ],
    stockOverview: {
      openingStock: 120,
      remainingStock: 80,
      onTheWay: 15,
      thresholdValue: 20
    }
  },
  {
    id: 'short-5',
    productName: 'Surf Excel 1kg',
    productDescription: 'Surf Excel detergent powder provides superior cleaning power for all types of fabrics. Removes tough stains and keeps clothes fresh and clean.',
    productId: '8899368',
    buyingPrice: 180,
    productCategory: 'Home Essentials',
    expiryDate: '10 October 2026',
    quantity: 75,
    thresholdValue: 15,
    supplier: {
      name: 'Hindustan Unilever Ltd.',
      contactNumber: '+91 9123456789'
    },
    stockLocations: [
      { storeName: 'Main Store', stockInHand: 30 },
      { storeName: 'Branch Store A', stockInHand: 25 },
      { storeName: 'Branch Store B', stockInHand: 20 }
    ],
    images: [
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center'
    ],
    stockOverview: {
      openingStock: 75,
      remainingStock: 45,
      onTheWay: 10,
      thresholdValue: 15
    }
  },
  {
    id: 'short-6',
    productName: 'Amul Milk 1L',
    productDescription: 'Amul Fresh Milk is pure, fresh, and nutritious. Rich in calcium and protein, it is perfect for daily consumption and cooking.',
    productId: '8899369',
    buyingPrice: 60,
    productCategory: 'Dairy',
    expiryDate: '25 July 2026',
    quantity: 200,
    thresholdValue: 30,
    supplier: {
      name: 'Amul India Ltd.',
      contactNumber: '+91 9123456789'
    },
    stockLocations: [
      { storeName: 'Main Store', stockInHand: 80 },
      { storeName: 'Branch Store A', stockInHand: 60 },
      { storeName: 'Branch Store B', stockInHand: 40 },
      { storeName: 'Cold Storage', stockInHand: 20 }
    ],
    images: [
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center'
    ],
    stockOverview: {
      openingStock: 200,
      remainingStock: 150,
      onTheWay: 25,
      thresholdValue: 30
    }
  },
  {
    id: 'short-7',
    productName: 'Tata Salt 1kg',
    productDescription: 'Tata Salt is pure, refined salt that enhances the taste of your food. Free from impurities and rich in iodine for better health.',
    productId: '8899370',
    buyingPrice: 25,
    productCategory: 'Grocery',
    expiryDate: 'No Expiry',
    quantity: 150,
    thresholdValue: 25,
    supplier: {
      name: 'Tata Chemicals Ltd.',
      contactNumber: '+91 9876543210'
    },
    stockLocations: [
      { storeName: 'Main Store', stockInHand: 60 },
      { storeName: 'Branch Store A', stockInHand: 45 },
      { storeName: 'Branch Store B', stockInHand: 35 },
      { storeName: 'Warehouse', stockInHand: 10 }
    ],
    images: [
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center'
    ],
    stockOverview: {
      openingStock: 150,
      remainingStock: 100,
      onTheWay: 20,
      thresholdValue: 25
    }
  },
  {
    id: 'short-8',
    productName: 'Lux Soap (Pack of 4)',
    productDescription: 'Lux Soap provides gentle cleansing with a luxurious fragrance. Made with natural ingredients, it leaves your skin soft and smooth.',
    productId: '8899371',
    buyingPrice: 80,
    productCategory: 'Personal Care',
    expiryDate: 'No Expiry',
    quantity: 90,
    thresholdValue: 18,
    supplier: {
      name: 'Hindustan Unilever Ltd.',
      contactNumber: '+91 9123456789'
    },
    stockLocations: [
      { storeName: 'Main Store', stockInHand: 35 },
      { storeName: 'Branch Store A', stockInHand: 30 },
      { storeName: 'Branch Store B', stockInHand: 25 }
    ],
    images: [
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center'
    ],
    stockOverview: {
      openingStock: 90,
      remainingStock: 60,
      onTheWay: 12,
      thresholdValue: 18
    }
  },
  // Out of Stock Product Details
  {
    id: 'out-1',
    productName: 'Parle-G Biscuit 1kg',
    productDescription: 'Parle-G biscuits are made with the finest ingredients and provide energy and nutrition. Perfect for breakfast, snacks, or anytime hunger strikes.',
    productId: 'OUT001',
    buyingPrice: 45,
    productCategory: 'Snacks & Bakery',
    expiryDate: '15 September 2026',
    quantity: 0,
    thresholdValue: 20,
    supplier: {
      name: 'Parle Distributor',
      contactNumber: '+91 9876543210'
    },
    stockLocations: [
      { storeName: 'Main Store', stockInHand: 0 },
      { storeName: 'Branch Store A', stockInHand: 0 },
      { storeName: 'Branch Store B', stockInHand: 0 }
    ],
    images: [
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center'
    ],
    stockOverview: {
      openingStock: 0,
      remainingStock: 0,
      onTheWay: 0,
      thresholdValue: 20
    }
  },
  {
    id: 'out-2',
    productName: 'Surf Excel 1kg',
    productDescription: 'Surf Excel detergent powder provides superior cleaning power for all types of fabrics. Removes tough stains and keeps clothes fresh and clean.',
    productId: 'OUT002',
    buyingPrice: 180,
    productCategory: 'Home Essentials',
    expiryDate: '10 October 2026',
    quantity: 0,
    thresholdValue: 15,
    supplier: {
      name: 'HUL Supplies',
      contactNumber: '+91 9123456789'
    },
    stockLocations: [
      { storeName: 'Main Store', stockInHand: 0 },
      { storeName: 'Branch Store A', stockInHand: 0 },
      { storeName: 'Branch Store B', stockInHand: 0 }
    ],
    images: [
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center'
    ],
    stockOverview: {
      openingStock: 0,
      remainingStock: 0,
      onTheWay: 0,
      thresholdValue: 15
    }
  },
  {
    id: 'out-3',
    productName: 'Amul Milk 1L',
    productDescription: 'Amul Fresh Milk is pure, fresh, and nutritious. Rich in calcium and protein, it is perfect for daily consumption and cooking.',
    productId: 'OUT003',
    buyingPrice: 60,
    productCategory: 'Dairy',
    expiryDate: '25 July 2026',
    quantity: 0,
    thresholdValue: 30,
    supplier: {
      name: 'Amul India Ltd.',
      contactNumber: '+91 9123456789'
    },
    stockLocations: [
      { storeName: 'Main Store', stockInHand: 0 },
      { storeName: 'Branch Store A', stockInHand: 0 },
      { storeName: 'Cold Storage', stockInHand: 0 }
    ],
    images: [
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center'
    ],
    stockOverview: {
      openingStock: 0,
      remainingStock: 0,
      onTheWay: 0,
      thresholdValue: 30
    }
  },
  // Low Quantity Product Details
  {
    id: 'low-1',
    productName: 'Tata Salt 1kg',
    productDescription: 'Tata Salt is pure, refined salt that enhances the taste of your food. Free from impurities and rich in iodine for better health.',
    productId: 'LOW001',
    buyingPrice: 25,
    productCategory: 'Grocery',
    expiryDate: 'No Expiry',
    quantity: 6,
    thresholdValue: 10,
    supplier: {
      name: 'Tata Consumer Ltd.',
      contactNumber: '+91 9876543210'
    },
    stockLocations: [
      { storeName: 'Main Store', stockInHand: 3 },
      { storeName: 'Branch Store A', stockInHand: 2 },
      { storeName: 'Branch Store B', stockInHand: 1 }
    ],
    images: [
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center'
    ],
    stockOverview: {
      openingStock: 6,
      remainingStock: 6,
      onTheWay: 0,
      thresholdValue: 10
    }
  },
  {
    id: 'low-2',
    productName: 'Lux Soap (Pack of 4)',
    productDescription: 'Lux Soap provides gentle cleansing with a luxurious fragrance. Made with natural ingredients, it leaves your skin soft and smooth.',
    productId: 'LOW002',
    buyingPrice: 80,
    productCategory: 'Personal Care',
    expiryDate: 'No Expiry',
    quantity: 3,
    thresholdValue: 10,
    supplier: {
      name: 'HUL Supplies',
      contactNumber: '+91 9123456789'
    },
    stockLocations: [
      { storeName: 'Main Store', stockInHand: 2 },
      { storeName: 'Branch Store A', stockInHand: 1 },
      { storeName: 'Branch Store B', stockInHand: 0 }
    ],
    images: [
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center'
    ],
    stockOverview: {
      openingStock: 3,
      remainingStock: 3,
      onTheWay: 0,
      thresholdValue: 10
    }
  },
  {
    id: 'low-3',
    productName: 'Aashirvaad Atta 5kg',
    productDescription: 'Aashirvaad Atta is made from the finest quality wheat grains, carefully selected and processed to ensure the perfect texture and taste for your daily rotis and parathas.',
    productId: 'LOW003',
    buyingPrice: 250,
    productCategory: 'Grocery',
    expiryDate: '15 September 2026',
    quantity: 13,
    thresholdValue: 15,
    supplier: {
      name: 'ITC Wholesalers',
      contactNumber: '+91 9876543210'
    },
    stockLocations: [
      { storeName: 'Main Store', stockInHand: 8 },
      { storeName: 'Branch Store A', stockInHand: 3 },
      { storeName: 'Branch Store B', stockInHand: 2 }
    ],
    images: [
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center'
    ],
    stockOverview: {
      openingStock: 13,
      remainingStock: 13,
      onTheWay: 0,
      thresholdValue: 15
    }
  },
  // Expired Product Details
  {
    id: 'exp-1',
    productName: 'Amul Butter 500g',
    productDescription: 'Amul Butter is made from fresh cream and is rich in taste. Perfect for spreading on bread, toast, and for cooking delicious meals.',
    productId: 'EXP001',
    buyingPrice: 30,
    productCategory: 'Dairy',
    expiryDate: '15 Jul 2025',
    quantity: 12,
    thresholdValue: 10,
    supplier: {
      name: 'Amul India Ltd.',
      contactNumber: '+91 9123456789'
    },
    stockLocations: [
      { storeName: 'Main Store', stockInHand: 8 },
      { storeName: 'Branch Store A', stockInHand: 4 },
      { storeName: 'Cold Storage', stockInHand: 0 }
    ],
    images: [
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center'
    ],
    stockOverview: {
      openingStock: 12,
      remainingStock: 12,
      onTheWay: 0,
      thresholdValue: 10
    }
  },
  {
    id: 'exp-2',
    productName: 'Parle-G Biscuits',
    productDescription: 'Parle-G biscuits are made with the finest ingredients and provide energy and nutrition. Perfect for breakfast, snacks, or anytime hunger strikes.',
    productId: 'EXP002',
    buyingPrice: 45,
    productCategory: 'Snacks & Bakery',
    expiryDate: '12 Jul 2025',
    quantity: 20,
    thresholdValue: 20,
    supplier: {
      name: 'Parle Products Ltd.',
      contactNumber: '+91 9876543210'
    },
    stockLocations: [
      { storeName: 'Main Store', stockInHand: 12 },
      { storeName: 'Branch Store A', stockInHand: 5 },
      { storeName: 'Branch Store B', stockInHand: 3 }
    ],
    images: [
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center'
    ],
    stockOverview: {
      openingStock: 20,
      remainingStock: 20,
      onTheWay: 0,
      thresholdValue: 20
    }
  },
  {
    id: 'exp-3',
    productName: 'Dabur Honey 250ml',
    productDescription: 'Dabur Honey is pure, natural honey that provides numerous health benefits. Rich in antioxidants and natural sweetness.',
    productId: 'EXP003',
    buyingPrice: 120,
    productCategory: 'Health & Wellness',
    expiryDate: '10 Jul 2025',
    quantity: 5,
    thresholdValue: 8,
    supplier: {
      name: 'Dabur India Ltd.',
      contactNumber: '+91 9876543210'
    },
    stockLocations: [
      { storeName: 'Main Store', stockInHand: 3 },
      { storeName: 'Branch Store A', stockInHand: 2 },
      { storeName: 'Branch Store B', stockInHand: 0 }
    ],
    images: [
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center'
    ],
    stockOverview: {
      openingStock: 5,
      remainingStock: 5,
      onTheWay: 0,
      thresholdValue: 8
    }
  },
  // Short Expiry Product Details
  {
    id: 'short-1',
    productName: 'Amul Cheese Slices',
    productDescription: 'Amul Cheese Slices are made from premium quality milk and are perfect for sandwiches, burgers, and cooking.',
    productId: 'SHORT001',
    buyingPrice: 80,
    productCategory: 'Dairy',
    expiryDate: '18 Aug 2025',
    quantity: 22,
    thresholdValue: 25,
    supplier: {
      name: 'Amul India Ltd.',
      contactNumber: '+91 9123456789'
    },
    stockLocations: [
      { storeName: 'Main Store', stockInHand: 12 },
      { storeName: 'Branch Store A', stockInHand: 6 },
      { storeName: 'Cold Storage', stockInHand: 4 }
    ],
    images: [
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center'
    ],
    stockOverview: {
      openingStock: 22,
      remainingStock: 22,
      onTheWay: 0,
      thresholdValue: 25
    }
  },
  {
    id: 'short-2',
    productName: 'Real Mango Juice',
    productDescription: 'Real Mango Juice is made from the finest mangoes and provides a refreshing taste with natural fruit goodness.',
    productId: 'SHORT002',
    buyingPrice: 60,
    productCategory: 'Beverages',
    expiryDate: '10 Aug 2025',
    quantity: 18,
    thresholdValue: 20,
    supplier: {
      name: 'Dabur India Ltd.',
      contactNumber: '+91 9876543210'
    },
    stockLocations: [
      { storeName: 'Main Store', stockInHand: 10 },
      { storeName: 'Branch Store A', stockInHand: 5 },
      { storeName: 'Branch Store B', stockInHand: 3 }
    ],
    images: [
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center'
    ],
    stockOverview: {
      openingStock: 18,
      remainingStock: 18,
      onTheWay: 0,
      thresholdValue: 20
    }
  },
  {
    id: 'short-3',
    productName: 'Harvest Bread Loaf',
    productDescription: 'Harvest Bread Loaf is made from premium wheat flour and is perfect for breakfast, sandwiches, and toast.',
    productId: 'SHORT003',
    buyingPrice: 35,
    productCategory: 'Bakery',
    expiryDate: '25 Jul 2025',
    quantity: 12,
    thresholdValue: 15,
    supplier: {
      name: 'Harvest Foods Ltd.',
      contactNumber: '+91 9876543210'
    },
    stockLocations: [
      { storeName: 'Main Store', stockInHand: 8 },
      { storeName: 'Branch Store A', stockInHand: 3 },
      { storeName: 'Branch Store B', stockInHand: 1 }
    ],
    images: [
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center'
    ],
    stockOverview: {
      openingStock: 12,
      remainingStock: 12,
      onTheWay: 0,
      thresholdValue: 15
    }
  },
  // Long Unsold Product Details
  {
    id: 'long-1',
    productName: 'Patanjali Dant Kanti',
    productDescription: 'Patanjali Dant Kanti is a natural toothpaste made with herbal ingredients that provides complete oral care and fresh breath.',
    productId: 'LONG001',
    buyingPrice: 45,
    productCategory: 'Personal Care',
    expiryDate: '15 December 2026',
    quantity: 32,
    thresholdValue: 20,
    supplier: {
      name: 'Patanjali Ayurved Ltd.',
      contactNumber: '+91 9876543210'
    },
    stockLocations: [
      { storeName: 'Main Store', stockInHand: 20 },
      { storeName: 'Branch Store A', stockInHand: 8 },
      { storeName: 'Branch Store B', stockInHand: 4 }
    ],
    images: [
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center'
    ],
    stockOverview: {
      openingStock: 32,
      remainingStock: 32,
      onTheWay: 0,
      thresholdValue: 20
    }
  },
  {
    id: 'long-2',
    productName: 'Kellogg\'s Chocos',
    productDescription: 'Kellogg\'s Chocos is a delicious chocolate-flavored breakfast cereal that kids love. Made with whole grains and fortified with vitamins.',
    productId: 'LONG002',
    buyingPrice: 155,
    productCategory: 'Breakfast Cereals',
    expiryDate: '20 November 2026',
    quantity: 15,
    thresholdValue: 10,
    supplier: {
      name: 'Kellogg India Pvt. Ltd.',
      contactNumber: '+91 9876543210'
    },
    stockLocations: [
      { storeName: 'Main Store', stockInHand: 10 },
      { storeName: 'Branch Store A', stockInHand: 3 },
      { storeName: 'Branch Store B', stockInHand: 2 }
    ],
    images: [
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center'
    ],
    stockOverview: {
      openingStock: 15,
      remainingStock: 15,
      onTheWay: 0,
      thresholdValue: 10
    }
  },
  {
    id: 'long-3',
    productName: 'Vim Dish Gel',
    productDescription: 'Vim Dish Gel provides powerful cleaning action for tough grease and food stains. Leaves dishes sparkling clean and fresh.',
    productId: 'LONG003',
    buyingPrice: 85,
    productCategory: 'Home Essentials',
    expiryDate: 'No Expiry',
    quantity: 28,
    thresholdValue: 15,
    supplier: {
      name: 'Hindustan Unilever Ltd.',
      contactNumber: '+91 9123456789'
    },
    stockLocations: [
      { storeName: 'Main Store', stockInHand: 18 },
      { storeName: 'Branch Store A', stockInHand: 6 },
      { storeName: 'Branch Store B', stockInHand: 4 }
    ],
    images: [
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center'
    ],
    stockOverview: {
      openingStock: 28,
      remainingStock: 28,
      onTheWay: 0,
      thresholdValue: 15
    }
  },
  // Top Selling Product Details
  {
    id: 'top-1',
    productName: 'Amul Milk 1L',
    productDescription: 'Amul Fresh Milk is pure, fresh, and nutritious. Rich in calcium and protein, it is perfect for daily consumption and cooking.',
    productId: 'TOP001',
    buyingPrice: 60,
    productCategory: 'Dairy',
    expiryDate: '25 July 2026',
    quantity: 120,
    thresholdValue: 30,
    supplier: {
      name: 'Amul India Ltd.',
      contactNumber: '+91 9123456789'
    },
    stockLocations: [
      { storeName: 'Main Store', stockInHand: 50 },
      { storeName: 'Branch Store A', stockInHand: 35 },
      { storeName: 'Branch Store B', stockInHand: 25 },
      { storeName: 'Cold Storage', stockInHand: 10 }
    ],
    images: [
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center'
    ],
    stockOverview: {
      openingStock: 120,
      remainingStock: 120,
      onTheWay: 0,
      thresholdValue: 30
    }
  },
  {
    id: 'top-2',
    productName: 'Tata Salt 1kg',
    productDescription: 'Tata Salt is pure, refined salt that enhances the taste of your food. Free from impurities and rich in iodine for better health.',
    productId: 'TOP002',
    buyingPrice: 25,
    productCategory: 'Grocery',
    expiryDate: 'No Expiry',
    quantity: 150,
    thresholdValue: 25,
    supplier: {
      name: 'Tata Chemicals Ltd.',
      contactNumber: '+91 9876543210'
    },
    stockLocations: [
      { storeName: 'Main Store', stockInHand: 60 },
      { storeName: 'Branch Store A', stockInHand: 45 },
      { storeName: 'Branch Store B', stockInHand: 35 },
      { storeName: 'Warehouse', stockInHand: 10 }
    ],
    images: [
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center'
    ],
    stockOverview: {
      openingStock: 150,
      remainingStock: 150,
      onTheWay: 0,
      thresholdValue: 25
    }
  },
  {
    id: 'top-3',
    productName: 'Aashirvaad Atta 5kg',
    productDescription: 'Aashirvaad Atta is made from the finest quality wheat grains, carefully selected and processed to ensure the perfect texture and taste for your daily rotis and parathas.',
    productId: 'TOP003',
    buyingPrice: 250,
    productCategory: 'Grocery',
    expiryDate: '15 September 2026',
    quantity: 200,
    thresholdValue: 30,
    supplier: {
      name: 'ITC Wholesalers',
      contactNumber: '+91 9876543210'
    },
    stockLocations: [
      { storeName: 'Main Store', stockInHand: 80 },
      { storeName: 'Branch Store A', stockInHand: 60 },
      { storeName: 'Branch Store B', stockInHand: 40 },
      { storeName: 'Warehouse', stockInHand: 20 }
    ],
    images: [
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center'
    ],
    stockOverview: {
      openingStock: 200,
      remainingStock: 200,
      onTheWay: 0,
      thresholdValue: 30
    }
  }
];

// Customer Data
export const mockCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: 'Aniket',
    phone: '+91-9876XXX123',
    email: 'aniket@example.com',
    customerId: 'CUST001',
    totalSpend: 12000,
    loyaltyTier: 'Gold',
    lastOrder: '12 Jul 2025',
    status: 'Active',
    registrationDate: '15 Jan 2024',
    totalOrders: 25,
    averageOrderValue: 480,
    preferredCategories: ['Grocery', 'Dairy', 'Personal Care'],
    address: {
      street: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001'
    }
  },
  {
    id: 'cust-2',
    name: 'Tanya Singh',
    phone: '+91-9876XXX123',
    email: 'tanya@example.com',
    customerId: 'CUST002',
    totalSpend: 6750,
    loyaltyTier: 'Bronze',
    lastOrder: '08 Jul 2025',
    status: 'Active',
    registrationDate: '22 Mar 2024',
    totalOrders: 12,
    averageOrderValue: 562,
    preferredCategories: ['Personal Care', 'Health'],
    address: {
      street: '456 Park Avenue',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001'
    }
  },
  {
    id: 'cust-3',
    name: 'Rajesh Kumar',
    phone: '+91-9876XXX123',
    email: 'rajesh@example.com',
    customerId: 'CUST003',
    totalSpend: 18500,
    loyaltyTier: 'Platinum',
    lastOrder: '15 Jul 2025',
    status: 'Active',
    registrationDate: '10 Dec 2023',
    totalOrders: 45,
    averageOrderValue: 411,
    preferredCategories: ['Grocery', 'Dairy', 'Home Essentials'],
    address: {
      street: '789 Garden Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001'
    }
  },
  {
    id: 'cust-4',
    name: 'Priya Sharma',
    phone: '+91-9876XXX123',
    email: 'priya@example.com',
    customerId: 'CUST004',
    totalSpend: 8900,
    loyaltyTier: 'Silver',
    lastOrder: '10 Jul 2025',
    status: 'Active',
    registrationDate: '05 Feb 2024',
    totalOrders: 18,
    averageOrderValue: 494,
    preferredCategories: ['Personal Care', 'Beauty'],
    address: {
      street: '321 Lake View',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600001'
    }
  },
  {
    id: 'cust-5',
    name: 'Vikram Patel',
    phone: '+91-9876XXX123',
    email: 'vikram@example.com',
    customerId: 'CUST005',
    totalSpend: 15200,
    loyaltyTier: 'Gold',
    lastOrder: '18 Jul 2025',
    status: 'Active',
    registrationDate: '28 Nov 2023',
    totalOrders: 32,
    averageOrderValue: 475,
    preferredCategories: ['Grocery', 'Dairy', 'Snacks'],
    address: {
      street: '654 Hill Station',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001'
    }
  },
  {
    id: 'cust-6',
    name: 'Sneha Reddy',
    phone: '+91-9876XXX123',
    email: 'sneha@example.com',
    customerId: 'CUST006',
    totalSpend: 4200,
    loyaltyTier: 'Bronze',
    lastOrder: '05 Jul 2025',
    status: 'Inactive',
    registrationDate: '15 Apr 2024',
    totalOrders: 8,
    averageOrderValue: 525,
    preferredCategories: ['Health', 'Personal Care'],
    address: {
      street: '987 Tech Park',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500001'
    }
  },
  {
    id: 'cust-7',
    name: 'Amit Gupta',
    phone: '+91-9876XXX123',
    email: 'amit@example.com',
    customerId: 'CUST007',
    totalSpend: 22100,
    loyaltyTier: 'Platinum',
    lastOrder: '20 Jul 2025',
    status: 'Active',
    registrationDate: '03 Sep 2023',
    totalOrders: 52,
    averageOrderValue: 425,
    preferredCategories: ['Grocery', 'Home Essentials', 'Dairy'],
    address: {
      street: '147 Business District',
      city: 'Gurgaon',
      state: 'Haryana',
      pincode: '122001'
    }
  },
  {
    id: 'cust-8',
    name: 'Kavya Nair',
    phone: '+91-9876XXX123',
    email: 'kavya@example.com',
    customerId: 'CUST008',
    totalSpend: 7300,
    loyaltyTier: 'Silver',
    lastOrder: '14 Jul 2025',
    status: 'Active',
    registrationDate: '20 Jan 2024',
    totalOrders: 15,
    averageOrderValue: 486,
    preferredCategories: ['Personal Care', 'Beauty', 'Health'],
    address: {
      street: '258 Coastal Road',
      city: 'Kochi',
      state: 'Kerala',
      pincode: '682001'
    }
  },
  {
    id: 'cust-9',
    name: 'Rohit Verma',
    phone: '+91-9876XXX123',
    email: 'rohit@example.com',
    customerId: 'CUST009',
    totalSpend: 9600,
    loyaltyTier: 'Silver',
    lastOrder: '16 Jul 2025',
    status: 'Active',
    registrationDate: '12 Mar 2024',
    totalOrders: 20,
    averageOrderValue: 480,
    preferredCategories: ['Grocery', 'Dairy', 'Snacks'],
    address: {
      street: '369 University Road',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700001'
    }
  },
  {
    id: 'cust-10',
    name: 'Deepika Joshi',
    phone: '+91-9876XXX123',
    email: 'deepika@example.com',
    customerId: 'CUST010',
    totalSpend: 13500,
    loyaltyTier: 'Gold',
    lastOrder: '19 Jul 2025',
    status: 'Active',
    registrationDate: '08 Oct 2023',
    totalOrders: 28,
    averageOrderValue: 482,
    preferredCategories: ['Personal Care', 'Beauty', 'Health'],
    address: {
      street: '741 Heritage Lane',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302001'
    }
  }
];

// Order Data
export const mockOrders: Order[] = [
  {
    id: 'order-1',
    orderId: '#12345',
    amount: 250,
    customer: 'Raj',
    status: 'Delivered',
    payment: 'UPI',
    deliveryDate: '12 July 2025',
    orderDate: '10 July 2025',
    items: [
      { productName: 'Dettol Handwash', quantity: 2, price: 120 },
      { productName: 'Tata Salt 1kg', quantity: 1, price: 25 }
    ],
    address: {
      street: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001'
    },
    trackingNumber: 'TRK123456789'
  },
  {
    id: 'order-2',
    orderId: '#12346',
    amount: 450,
    customer: 'Tanya',
    status: 'Pending',
    payment: 'COD',
    deliveryDate: '14 July 2025',
    orderDate: '12 July 2025',
    items: [
      { productName: 'Aashirvaad Atta 5kg', quantity: 1, price: 250 },
      { productName: 'Amul Milk 1L', quantity: 2, price: 60 }
    ],
    address: {
      street: '456 Park Avenue',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001'
    }
  },
  {
    id: 'order-3',
    orderId: '#12347',
    amount: 180,
    customer: 'Raj',
    status: 'Cancelled',
    payment: 'UPI',
    deliveryDate: '15 July 2025',
    orderDate: '13 July 2025',
    items: [
      { productName: 'Colgate Toothpaste', quantity: 1, price: 80 },
      { productName: 'Lux Soap', quantity: 2, price: 50 }
    ],
    address: {
      street: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001'
    }
  },
  {
    id: 'order-4',
    orderId: '#12348',
    amount: 320,
    customer: 'Priya',
    status: 'Pending',
    payment: 'Card',
    deliveryDate: '16 July 2025',
    orderDate: '14 July 2025',
    items: [
      { productName: 'Surf Excel 1kg', quantity: 1, price: 180 },
      { productName: 'Rice 5kg', quantity: 1, price: 300 }
    ],
    address: {
      street: '321 Lake View',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600001'
    }
  },
  {
    id: 'order-5',
    orderId: '#12349',
    amount: 150,
    customer: 'Vikram',
    status: 'Pending',
    payment: 'UPI',
    deliveryDate: '17 July 2025',
    orderDate: '15 July 2025',
    items: [
      { productName: 'Maggi Noodles', quantity: 3, price: 45 },
      { productName: 'Bread', quantity: 2, price: 25 }
    ],
    address: {
      street: '654 Hill Station',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001'
    },
    trackingNumber: 'TRK987654321'
  },
  {
    id: 'order-6',
    orderId: '#12350',
    amount: 280,
    customer: 'Sneha',
    status: 'Delivered',
    payment: 'COD',
    deliveryDate: '18 July 2025',
    orderDate: '16 July 2025',
    items: [
      { productName: 'Dabur Honey 250ml', quantity: 1, price: 120 },
      { productName: 'Amul Butter 500g', quantity: 2, price: 60 }
    ],
    address: {
      street: '987 Tech Park',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500001'
    },
    trackingNumber: 'TRK456789123'
  },
  {
    id: 'order-7',
    orderId: '#12351',
    amount: 400,
    customer: 'Amit',
    status: 'Pending',
    payment: 'Net Banking',
    deliveryDate: '19 July 2025',
    orderDate: '17 July 2025',
    items: [
      { productName: 'Lux Soap (Pack of 4)', quantity: 2, price: 80 },
      { productName: 'Tata Tea Gold', quantity: 1, price: 120 }
    ],
    address: {
      street: '147 Business District',
      city: 'Gurgaon',
      state: 'Haryana',
      pincode: '122001'
    }
  },
  {
    id: 'order-8',
    orderId: '#12352',
    amount: 220,
    customer: 'Kavya',
    status: 'Delivered',
    payment: 'UPI',
    deliveryDate: '20 July 2025',
    orderDate: '18 July 2025',
    items: [
      { productName: 'Real Mango Juice', quantity: 2, price: 60 },
      { productName: 'Harvest Bread Loaf', quantity: 3, price: 35 }
    ],
    address: {
      street: '258 Coastal Road',
      city: 'Kochi',
      state: 'Kerala',
      pincode: '682001'
    },
    trackingNumber: 'TRK789123456'
  },
  {
    id: 'order-9',
    orderId: '#12353',
    amount: 350,
    customer: 'Rohit',
    status: 'Cancelled',
    payment: 'COD',
    deliveryDate: '21 July 2025',
    orderDate: '19 July 2025',
    items: [
      { productName: 'Patanjali Dant Kanti', quantity: 1, price: 45 },
      { productName: 'Kellogg\'s Chocos', quantity: 1, price: 155 }
    ],
    address: {
      street: '369 University Road',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700001'
    }
  },
  {
    id: 'order-10',
    orderId: '#12354',
    amount: 190,
    customer: 'Deepika',
    status: 'Pending',
    payment: 'Card',
    deliveryDate: '22 July 2025',
    orderDate: '20 July 2025',
    items: [
      { productName: 'Vim Dish Gel', quantity: 1, price: 99 },
      { productName: 'Britannia Biscuits', quantity: 2, price: 55 }
    ],
    address: {
      street: '741 Heritage Lane',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302001'
    },
    trackingNumber: 'TRK321654987'
  }
];

// Order Summary Data
export const mockOrderSummary: OrderSummary = {
  totalOrders: 868,
  totalReceived: 808,
  totalReturned: 10,
  onTheWay: 22,
  revenue: 25000,
  returnAmount: 2500,
  onTheWayCost: 23200,
  trends: {
    totalOrders: { value: 868, percentage: 12 },
    totalReceived: { value: 808, percentage: 8 },
    totalReturned: { value: 10, percentage: -5 },
    onTheWay: { value: 22, percentage: 15 }
  }
};
