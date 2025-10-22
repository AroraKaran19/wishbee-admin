import { Category, Product } from ".";

export interface Coupon {
  _id?: string;
  code: string; // e.g., "SAVE10"
  type: "percentage" | "fixed";
  description: string; // it will be html content
  value: number;

  applicableProducts?: Partial<Product>[]; // Product IDs for specific product discounts
  applicableCategories?: Partial<Category>[]; // Category IDs for category discounts
  minimumPurchaseAmount?: number;
  maximumDiscountAmount?: number; // Cap the discount amount

  validFrom: Date;
  validUntil: Date;
  maxUses?: number;
  currentUses: number; // Track usage
  isActive: boolean;

  termsAndConditions: string; // it will be html content

  createdAt?: Date;
  updatedAt?: Date;
}
