import { Discount, Product, Review } from ".";

export interface ComboProduct {
  // Basic Details
  _id?: string;
  name: string;
  type: "combo";
  description: string;
  products: Partial<Product>[];
  productIds: string[];
  highlights: {
    key: string;
    value: string;
  }[];
  images: string[];
  status: "ACTIVE" | "OUT_OF_STOCK" | "DISCONTINUED";
  isOrganic: boolean;
  mrp: number;

  // Reviews
  reviews: Partial<Review>[];

  // Discount
  discount: Discount;

  // Quantity
  minimumOrderQuantity?: number;
  maximumOrderQuantity?: number;

  // Metrics
  stock: number;
  reviewsCount: number;
  totalRating: number;

  alertExpiry?: number; // Number of days before expiry to trigger alert (e.g., 1, 2, 3, 4, 5)
  expiry?: Date; // Optional expiry date for perishable items

  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  slug?: string;

  createdAt?: Date;
  updatedAt?: Date;
}
