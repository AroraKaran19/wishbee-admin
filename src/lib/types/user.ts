import { Address, ComboProduct, Order, Product } from ".";

export interface User {
  _id?: string;
  email?: string;
  photo?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role?: "ADMIN" | "SUPER_ADMIN" | "CUSTOMER";

  refreshTokens: {
    token: string;
    deviceInfo?: {
      userAgent?: string;
      ipAddress?: string;
      deviceType?: string;
    };
    createdAt: Date;
    lastUsed: Date;
    expiresAt: Date;
    isActive: boolean;
  }[];

  isActive: boolean;

  permissions?: string[];

  createdAt?: Date;
  updatedAt?: Date;
}

export interface GovtId {
  type: "GST" | "PAN" | "UDYAM" | "SHOP_LICENSE" | "OTHER";
  number: string;
}

export interface Consumer extends User {
  addresses?: Address[];
  defaultAddress?: Address;

  preferences?: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    preferredPaymentMethod?: string; // e.g., card, UPI, COD
  };

  cart?: {
    _id?: string;
    userId: string;

    items: {
      product: Partial<Product | ComboProduct>; // can be product id or product object
      productType: "product" | "combo"; // Distinguish between regular products and combo products
      quantity: number;
      addedAt: Date;
    }[];

    createdAt?: Date;
    updatedAt?: Date;
  };

  govtId?: GovtId; // Replaces gstNumber - optional object with type and number
  orders?: string[]; // Array of order IDs (strings) instead of Order objects
  totalSpend?: number; // Total amount spent across all orders

  loyaltyTier?: "BRONZE" | "SILVER" | "GOLD" | "TITANIUM" | "PLATINUM" | "DIAMOND" | "KOHINOOR" | null;
  loyaltyPoints?: number;
  loyaltyPointsHistory?: {
    date: Date;
    points: number;
    description: string;
    type: "credit" | "debit";
    source?: string;
  }[];

  storeName?: string;

  firstTimeLogin?: boolean;
  joinedAt?: string | Date; // Used in profile responses (alternative to createdAt)
}

export interface Admin extends User {
  password?: string;
}
