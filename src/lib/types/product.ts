import { Category, Discount, Review } from ".";

export interface Product {
  // Basic Details
  _id?: string;
  sku: string; // Stock Keeping Unit for barcode value
  hsn?: string; // Harmonized System of Nomenclature code
  name: string;
  type: "product";
  description: string;
  highlights: {
    key: string;
    value: string;
  }[];
  category: Partial<Category>; // Populated category data
  subCategory: Partial<Category>;
  images: string[];
  status: "ACTIVE" | "OUT_OF_STOCK" | "DISCONTINUED";
  isOrganic: boolean;
  
  // Pricing
  mrp: number;
  gst?: number; // Goods and Services Tax
  pricing_range: {
    quantity_start: number;
    quantity_end: number;
    price: number;
  }[];

  // Reviews
  reviews: Partial<Review>[]; // can be review ids or review objects

  // Discount
  discount?: Discount;

  // Quantity
  minimumOrderQuantity?: number;
  maximumOrderQuantity?: number;

  // Metrics
  stock: number;
  weight: {
    value: number;
    unit: string; // let the admin decide the unit example packet, kg, etc
  };
  reviewsCount: number;
  totalRating: number;

  // Product Collections
  productCollections?: {
    quantity: number;
    price: number;
    unit?: string; // let the admin decide the unit example packet, kg, etc
  }[];

  alertExpiry?: number; // Number of days before expiry to trigger alert
  expiry?: Date; // Optional expiry date for perishable items
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  slug?: string;
  isB2B: boolean;

  // showcase
  dotd: boolean;
  pfy: boolean;
  isEssential: boolean;

  createdAt?: Date;
  updatedAt?: Date;
  lastSoldAt?: Date | string | null; // Date when product was last sold (null if never sold)
  soldQuantity?: number; // For top selling products - Total quantity sold in the last 30 days
  revenue?: number; // For top selling products - Total revenue generated in the last 30 days
}
