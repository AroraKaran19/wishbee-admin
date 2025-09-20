import mongoose from "mongoose";

export interface Product {
  // Basic Details
  _id?: string;
  sku: string; // Stock Keeping Unit for barcode value
  name: string;
  description: string;
  highlights: string[];
  categoryId: mongoose.Types.ObjectId;
  subCategory: mongoose.Types.ObjectId;
  images: string[];
  status: "ACTIVE" | "OUT_OF_STOCK" | "DISCONTINUED";
  isOrganic: boolean;
  price: {
    single: number;
    bulk: number;
  };

  // Reviews
  reviews: mongoose.Types.ObjectId[];

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
      unit: string; // let the admin decide the unit example packet, kg, etc
    };
    bulk: {
      value: number;
      unit: string; // let the admin decide the unit example packet, kg, etc
    };
  };
  reviewsCount: number;
  totalRating: number;

  // collection
  collection?: {
    quantity: number;
    price: number;
    unit?: string; // let the admin decide the unit example packet, kg, etc
  }[]; // if the product is also available in collection like 5kg, 2 packets, etc

  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  slug?: string;

  createdAt?: Date;
  updatedAt?: Date;
}
