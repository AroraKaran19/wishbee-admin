import { Product, InventorySummary, NavItem, OutOfStockItem, LowQuantityItem, ExpiredItem, ShortExpiryItem, LongUnsoldItem, TopSellingItem, ProductDetail, Customer, Order, OrderSummary } from '../types';

export const mockProducts: Product[] = [
  {
    _id: '1',
    sku: 'DET001',
    name: 'Dettol Handwash',
    type: 'product',
    description: 'Antibacterial handwash for effective hand hygiene',
    highlights: [
      { key: 'Germ Protection', value: 'Kills 99.9% germs' },
      { key: 'Formula', value: 'Moisturizing formula' },
      { key: 'Testing', value: 'Dermatologically tested' }
    ],
    category: {
      _id: "12345678",
      name: "Personal Care",
      description: "Personal hygiene and care products",
      slug: "personal-care",
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    subCategory: {
      _id: "12345679",
      name: "Hand Care",
      description: "Hand hygiene and care products",
      slug: "hand-care",
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    images: ['/images/dettol-handwash-1.jpg', '/images/dettol-handwash-2.jpg'],
    status: "ACTIVE",
    isOrganic: false,
    mrp: 120,
    pricing_range: [
      { quantity_start: 1, quantity_end: 5, price: 120 },
      { quantity_start: 6, quantity_end: 10, price: 100 }
    ],
    reviews: [],
    discount: {
      type: 'percentage',
      value: 15,
      isActive: true
    },
    minimumOrderQuantity: 1,
    maximumOrderQuantity: 100,
    stock: 42,
    weight: {
      value: 200,
      unit: 'ml'
    },
    reviewsCount: 0,
    totalRating: 0,
    productCollections: [
      { quantity: 10, price: 1000, unit: 'ml' }
    ],
    alertExpiry: 7,
    expiry: new Date('2025-12-31'),
    metaTitle: 'Dettol Handwash - Antibacterial Hand Hygiene',
    metaDescription: 'Buy Dettol Handwash online. Kills 99.9% germs with moisturizing formula.',
    metaKeywords: ['handwash', 'dettol', 'antibacterial', 'hygiene'],
    slug: 'dettol-handwash',
    isB2B: false,
    dotd: false,
    pfy: false,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-06-22'),
  },
  {
    _id: 'top-2',
    sku: 'AAS001',
    name: 'Aashirvaad Atta 5kg',
    type: 'product',
    description: 'Premium whole wheat flour for healthy rotis and breads',
    highlights: [
      { key: 'Quality', value: '100% whole wheat' },
      { key: 'Natural', value: 'No preservatives' },
      { key: 'Nutrition', value: 'Rich in fiber' }
    ],
    category: {
      _id: "12345678",
      name: "Personal Care",
      description: "Personal hygiene and care products",
      slug: "personal-care",
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    subCategory: {
      _id: "12345679",
      name: "Hand Care",
      description: "Hand hygiene and care products",
      slug: "hand-care",
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    images: ['/images/aashirvaad-atta-1.jpg'],
    status: "ACTIVE",
    isOrganic: false,
    mrp: 250,
    pricing_range: [
      { quantity_start: 1, quantity_end: 5, price: 250 },
      { quantity_start: 6, quantity_end: 10, price: 220 }
    ],
    reviews: [],
    discount: {
      type: 'percentage',
      value: 10,
      isActive: true
    },
    minimumOrderQuantity: 1,
    maximumOrderQuantity: 50,
    stock: 42,
    weight: {
      value: 5,
      unit: 'kg'
    },
    reviewsCount: 0,
    totalRating: 0,
    productCollections: [
      { quantity: 20, price: 4500, unit: 'kg' }
    ],
    alertExpiry: 7,
    expiry: new Date('2025-12-31'),
    metaTitle: 'Aashirvaad Atta 5kg - Premium Whole Wheat Flour',
    metaDescription: 'Buy Aashirvaad Atta 5kg online. 100% whole wheat flour for healthy cooking.',
    metaKeywords: ['atta', 'wheat flour', 'aashirvaad', 'whole wheat'],
    slug: 'aashirvaad-atta-5kg',
    isB2B: false,
    dotd: false,
    pfy: false,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-06-22'),
    
  },
  {
    _id: 'long-3',
    sku: 'AMU001',
    name: 'Amul Butter 500g',
    type: 'product',
    description: 'Pure and fresh butter made from cow\'s milk',
    highlights: [
      { key: 'Quality', value: 'Pure cow\'s milk' },
      { key: 'Natural', value: 'No preservatives' },
      { key: 'Taste', value: 'Rich taste' }
    ],
    category: {
      _id: "12345678",
      name: "Personal Care",
      description: "Personal hygiene and care products",
      slug: "personal-care",
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    subCategory: {
      _id: "12345679",
      name: "Hand Care",
      description: "Hand hygiene and care products",
      slug: "hand-care",
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    images: ['/images/amul-butter-1.jpg'],
    status: "OUT_OF_STOCK",
    isOrganic: false,
    mrp: 30,
    pricing_range: [
      { quantity_start: 1, quantity_end: 5, price: 30 },
      { quantity_start: 6, quantity_end: 10, price: 25 }
    ],
    reviews: [],
    discount: {
      type: 'percentage',
      value: 0,
      isActive: true
    },
    minimumOrderQuantity: 1,
    maximumOrderQuantity: 20,
    stock: 0,
    weight: {
      value: 500,
      unit: 'g'
    },
    reviewsCount: 0,
    totalRating: 0,
    productCollections: [],
    alertExpiry: 7,
    expiry: new Date('2025-12-31'),
    metaTitle: 'Amul Butter 500g - Pure Cow\'s Milk Butter',
    metaDescription: 'Buy Amul Butter 500g online. Pure and fresh butter made from cow\'s milk.',
    metaKeywords: ['butter', 'amul', 'cow milk', 'dairy'],
    slug: 'amul-butter-500g',
    isB2B: false,
    dotd: false,
    pfy: false,
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-06-22'),
    
  },
  {
    _id: 'out-4',
    sku: 'MAG001',
    name: 'Maggi Noodles',
    type: 'product',
    description: 'Instant noodles ready in 2 minutes',
    highlights: [
      { key: 'Convenience', value: 'Ready in 2 minutes' },
      { key: 'Taste', value: 'Tasty masala' },
      { key: 'Quality', value: 'No preservatives' }
    ],
    category: {
      _id: "12345678",
      name: "Personal Care",
      description: "Personal hygiene and care products",
      slug: "personal-care",
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    subCategory: {
      _id: "12345679",
      name: "Hand Care",
      description: "Hand hygiene and care products",
      slug: "hand-care",
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    images: ['/images/maggi-noodles-1.jpg'],
    status: "ACTIVE",
    isOrganic: false,
    mrp: 15,
    pricing_range: [
      { quantity_start: 1, quantity_end: 10, price: 15 },
      { quantity_start: 11, quantity_end: 20, price: 12 }
    ],
    reviews: [],
    discount: {
      type: 'percentage',
      value: 5,
      isActive: true
    },
    minimumOrderQuantity: 1,
    maximumOrderQuantity: 200,
    stock: 25,
    weight: {
      value: 70,
      unit: 'g'
    },
    reviewsCount: 0,
    totalRating: 0,
    productCollections: [],
    alertExpiry: 7,
    expiry: new Date('2025-12-31'),
    metaTitle: 'Maggi Noodles - Instant 2-Minute Noodles',
    metaDescription: 'Buy Maggi Noodles online. Ready in 2 minutes with tasty masala.',
    metaKeywords: ['noodles', 'maggi', 'instant', 'ready to eat'],
    slug: 'maggi-noodles',
    isB2B: false,
    dotd: false,
    pfy: false,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-06-20'),
    
  },
  {
    _id: 'short-5',
    sku: 'COL001',
    name: 'Colgate Toothpaste',
    type: 'product',
    description: 'Complete protection toothpaste for healthy teeth and gums',
    highlights: [
      { key: 'Protection', value: 'Complete protection' },
      { key: 'Freshness', value: 'Fresh breath' },
      { key: 'Health', value: 'Fluoride protection' }
    ],
    category: {
      _id: "12345678",
      name: "Personal Care",
      description: "Personal hygiene and care products",
      slug: "personal-care",
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    subCategory: {
      _id: "12345679",
      name: "Hand Care",
      description: "Hand hygiene and care products",
      slug: "hand-care",
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    images: ['/images/colgate-toothpaste-1.jpg'],
    status: "OUT_OF_STOCK",
    isOrganic: false,
    mrp: 80,
    pricing_range: [
      { quantity_start: 1, quantity_end: 5, price: 80 },
      { quantity_start: 6, quantity_end: 10, price: 70 }
    ],
    reviews: [],
    discount: {
      type: 'percentage',
      value: 8,
      isActive: true
    },
    minimumOrderQuantity: 1,
    maximumOrderQuantity: 50,
    stock: 0,
    weight: {
      value: 150,
      unit: 'g'
    },
    reviewsCount: 0,
    totalRating: 0,
    productCollections: [],
    alertExpiry: 7,
    expiry: new Date('2025-12-31'),
    metaTitle: 'Colgate Toothpaste - Complete Protection',
    metaDescription: 'Buy Colgate Toothpaste online. Complete protection for healthy teeth and gums.',
    metaKeywords: ['toothpaste', 'colgate', 'dental care', 'oral hygiene'],
    slug: 'colgate-toothpaste',
    isB2B: false,
    dotd: false,
    pfy: false,
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-06-18'),
    
  },
  {
    _id: 'short-6',
    sku: 'MIL001',
    name: 'Milk 1L',
    type: 'product',
    description: 'Fresh cow\'s milk, pasteurized and homogenized',
    highlights: [
      { key: 'Quality', value: 'Fresh cow\'s milk' },
      { key: 'Process', value: 'Pasteurized' },
      { key: 'Nutrition', value: 'Rich in calcium' }
    ],
    category: {
      _id: "12345678",
      name: "Personal Care",
      description: "Personal hygiene and care products",
      slug: "personal-care",
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    subCategory: {
      _id: "12345679",
      name: "Hand Care",
      description: "Hand hygiene and care products",
      slug: "hand-care",
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    images: ['/images/milk-1l-1.jpg'],
    status: "ACTIVE",
    isOrganic: false,
    mrp: 60,
    pricing_range: [
      { quantity_start: 1, quantity_end: 5, price: 60 },
      { quantity_start: 6, quantity_end: 10, price: 55 }
    ],
    reviews: [],
    discount: {
      type: 'percentage',
      value: 0,
      isActive: true
    },
    minimumOrderQuantity: 1,
    maximumOrderQuantity: 10,
    stock: 15,
    weight: {
      value: 1,
      unit: 'L'
    },
    reviewsCount: 0,
    totalRating: 0,
    productCollections: [],
    alertExpiry: 7,
    expiry: new Date('2025-12-31'),
    metaTitle: 'Fresh Milk 1L - Pasteurized Cow\'s Milk',
    metaDescription: 'Buy fresh milk 1L online. Pasteurized and homogenized cow\'s milk.',
    metaKeywords: ['milk', 'fresh', 'cow milk', 'dairy', 'pasteurized'],
    slug: 'milk-1l',
    isB2B: false,
    dotd: false,
    pfy: false,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-06-21'),
    
  },
  {
    _id: 'short-7',
    sku: 'RIC001',
    name: 'Rice 5kg',
    type: 'product',
    description: 'Premium basmati rice, long grain and aromatic',
    highlights: [
      { key: 'Quality', value: 'Premium basmati' },
      { key: 'Type', value: 'Long grain' },
      { key: 'Aroma', value: 'Aromatic' }
    ],
    category: {
      _id: "12345678",
      name: "Personal Care",
      description: "Personal hygiene and care products",
      slug: "personal-care",
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    subCategory: {
      _id: "12345679",
      name: "Hand Care",
      description: "Hand hygiene and care products",
      slug: "hand-care",
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    images: ['/images/rice-5kg-1.jpg'],
    status: "ACTIVE",
    isOrganic: false,
    mrp: 300,
    pricing_range: [
      { quantity_start: 1, quantity_end: 5, price: 300 },
      { quantity_start: 6, quantity_end: 10, price: 280 }
    ],
    reviews: [],
    discount: {
      type: 'percentage',
      value: 12,
      isActive: true
    },
    minimumOrderQuantity: 1,
    maximumOrderQuantity: 20,
    stock: 8,
    weight: {
      value: 5,
      unit: 'kg'
    },
    reviewsCount: 0,
    totalRating: 0,
    productCollections: [],
    alertExpiry: 7,
    expiry: new Date('2025-12-31'),
    metaTitle: 'Premium Basmati Rice 5kg - Long Grain Aromatic',
    metaDescription: 'Buy premium basmati rice 5kg online. Long grain and aromatic rice.',
    metaKeywords: ['rice', 'basmati', 'long grain', 'aromatic', 'premium'],
    slug: 'rice-5kg',
    isB2B: false,
    dotd: false,
    pfy: false,
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-06-19'),
    
  },
  {
    _id: 'short-8',
    sku: 'SHA001',
    name: 'Shampoo',
    type: 'product',
    description: 'Gentle cleansing shampoo for all hair types',
    highlights: [
      { key: 'Gentle', value: 'Gentle cleansing' },
      { key: 'Universal', value: 'All hair types' },
      { key: 'Natural', value: 'Sulfate-free' }
    ],
    category: {
      _id: "12345678",
      name: "Personal Care",
      description: "Personal hygiene and care products",
      slug: "personal-care",
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    subCategory: {
      _id: "12345679",
      name: "Hand Care",
      description: "Hand hygiene and care products",
      slug: "hand-care",
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    images: ['/images/shampoo-1.jpg'],
    status: "ACTIVE",
    isOrganic: false,
    mrp: 200,
    pricing_range: [
      { quantity_start: 1, quantity_end: 5, price: 200 },
      { quantity_start: 6, quantity_end: 10, price: 180 }
    ],
    reviews: [],
    discount: {
      type: 'percentage',
      value: 10,
      isActive: true
    },
    minimumOrderQuantity: 1,
    maximumOrderQuantity: 30,
    stock: 12,
    weight: {
      value: 400,
      unit: 'ml'
    },
    reviewsCount: 0,
    totalRating: 0,
    productCollections: [],
    alertExpiry: 7,
    expiry: new Date('2025-12-31'),
    metaTitle: 'Gentle Shampoo - All Hair Types',
    metaDescription: 'Buy gentle shampoo online. Suitable for all hair types with sulfate-free formula.',
    metaKeywords: ['shampoo', 'hair care', 'gentle', 'sulfate-free'],
    slug: 'shampoo',
    isB2B: false,
    dotd: false,
    pfy: false,
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-06-17'),
    
  },
  {
    _id: 'short-9',
    sku: 'BRE001',
    name: 'Bread',
    type: 'product',
    description: 'Fresh white bread, soft and fluffy',
    highlights: [
      { key: 'Freshness', value: 'Fresh baked' },
      { key: 'Texture', value: 'Soft and fluffy' },
      { key: 'Natural', value: 'No preservatives' }
    ],
    category: {
      _id: "12345678",
      name: "Personal Care",
      description: "Personal hygiene and care products",
      slug: "personal-care",
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    subCategory: {
      _id: "12345679",
      name: "Hand Care",
      description: "Hand hygiene and care products",
      slug: "hand-care",
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    images: ['/images/bread-1.jpg'],
    status: "OUT_OF_STOCK",
    isOrganic: false,
    mrp: 25,
    pricing_range: [
      { quantity_start: 1, quantity_end: 5, price: 25 },
      { quantity_start: 6, quantity_end: 10, price: 22 }
    ],
    reviews: [],
    discount: {
      type: 'percentage',
      value: 0,
      isActive: true
    },
    minimumOrderQuantity: 1,
    maximumOrderQuantity: 20,
    stock: 0,
    weight: {
      value: 400,
      unit: 'g'
    },
    reviewsCount: 0,
    totalRating: 0,
    productCollections: [],
    alertExpiry: 7,
    expiry: new Date('2025-12-31'),
    metaTitle: 'Fresh White Bread - Soft and Fluffy',
    metaDescription: 'Buy fresh white bread online. Soft and fluffy bread with no preservatives.',
    metaKeywords: ['bread', 'white bread', 'fresh', 'bakery'],
    slug: 'bread',
    isB2B: false,
    dotd: false,
    pfy: false,
    createdAt: new Date('2024-02-25'),
    updatedAt: new Date('2024-06-16'),
    
  },
  {
    _id: '10',
    sku: 'BUT001',
    name: 'Butter',
    type: 'product',
    description: 'Creamy butter perfect for cooking and spreading',
    highlights: [
      { key: 'Texture', value: 'Creamy texture' },
      { key: 'Usage', value: 'Perfect for cooking' },
      { key: 'Taste', value: 'Rich taste' }
    ],
    category: {
      _id: "12345678",
      name: "Personal Care",
      description: "Personal hygiene and care products",
      slug: "personal-care",
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    subCategory: {
      _id: "12345679",
      name: "Hand Care",
      description: "Hand hygiene and care products",
      slug: "hand-care",
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    images: ['/images/butter-1.jpg'],
    status: "ACTIVE",
    isOrganic: false,
    mrp: 25,
    pricing_range: [
      { quantity_start: 1, quantity_end: 5, price: 25 },
      { quantity_start: 6, quantity_end: 10, price: 22 }
    ],
    reviews: [],
    discount: {
      type: 'percentage',
      value: 5,
      isActive: true
    },
    minimumOrderQuantity: 1,
    maximumOrderQuantity: 15,
    stock: 10,
    weight: {
      value: 100,
      unit: 'g'
    },
    reviewsCount: 0,
    totalRating: 0,
    productCollections: [],
    alertExpiry: 7,
    expiry: new Date('2025-12-31'),
    metaTitle: 'Creamy Butter - Perfect for Cooking',
    metaDescription: 'Buy creamy butter online. Perfect for cooking and spreading with rich taste.',
    metaKeywords: ['butter', 'creamy', 'cooking', 'dairy'],
    slug: 'butter',
    isB2B: false,
    dotd: false,
    pfy: false,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-06-16'),
    
  },
  {
    _id: '11',
    sku: 'PAN001',
    name: 'Paneer',
    type: 'product',
    description: 'Fresh cottage cheese, soft and crumbly',
    highlights: [
      { key: 'Quality', value: 'Fresh cottage cheese' },
      { key: 'Texture', value: 'Soft texture' },
      { key: 'Nutrition', value: 'High protein' }
    ],
    category: {
      _id: "12345678",
      name: "Personal Care",
      description: "Personal hygiene and care products",
      slug: "personal-care",
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    subCategory: {
      _id: "12345679",
      name: "Hand Care",
      description: "Hand hygiene and care products",
      slug: "hand-care",
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    images: ['/images/paneer-1.jpg'],
    status: "OUT_OF_STOCK",
    isOrganic: false,
    mrp: 150,
    pricing_range: [
      { quantity_start: 1, quantity_end: 5, price: 150 },
      { quantity_start: 6, quantity_end: 10, price: 140 }
    ],
    reviews: [],
    discount: {
      type: 'percentage',
      value: 0,
      isActive: true
    },
    minimumOrderQuantity: 1,
    maximumOrderQuantity: 10,
    stock: 0,
    weight: {
      value: 200,
      unit: 'g'
    },
    reviewsCount: 0,
    totalRating: 0,
    productCollections: [],
    alertExpiry: 7,
    expiry: new Date('2025-12-31'),
    metaTitle: 'Fresh Paneer - Soft Cottage Cheese',
    metaDescription: 'Buy fresh paneer online. Soft and crumbly cottage cheese with high protein.',
    metaKeywords: ['paneer', 'cottage cheese', 'fresh', 'protein', 'dairy'],
    slug: 'paneer',
    isB2B: false,
    dotd: false,
    pfy: false,
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-06-21'),
    
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
