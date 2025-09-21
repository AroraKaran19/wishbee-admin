import { Category } from "./category";

export interface Product {
  // Basic Details
  _id?: string;
  sku: string;
  name: string;
  description: string;
  highlights: string[];
  category: Category;
  subCategory: Category;
  images: string[];
  status: "ACTIVE" | "OUT_OF_STOCK" | "DISCONTINUED";
  isOrganic: boolean;
  price: {
    single: number;
    bulk: number;
  };

  // Reviews
  reviews: [];

  // Discount
  discount: {
    type: "percentage" | "fixed";
    value: number;
  };

  // Quantity
  minimumOrderQuantity?: number;
  maximumOrderQuantity?: number;

  // Metrics
  stock: number;
  weight: {
    single: {
      value: number;
      unit: string;
    };
    bulk: {
      value: number;
      unit: string;
    };
  };
  reviewsCount: number;
  totalRating: number;

  // Product Collections
  productCollections?: {
    quantity: number;
    price: number;
    unit?: string;
  }[];

  // Expiry
  expiry?: string;
  alertExpiry?: number;

  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  slug?: string;

  createdAt?: Date;
  updatedAt?: Date;
}
