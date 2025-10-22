import { User, Product } from ".";

export interface Order {
  _id?: string;
  refId: string; // this will be used to track the order in the payment gateway
  userId: Partial<User>;
  items: {
    product: Partial<Product>;
    productType: "product" | "combo"; // Distinguish between products and combos
    quantity: number;
    priceAtPurchase: number;
    discountApplied?: number;
  }[];
  totalAmount: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  billingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  status:
    | "PENDING"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "RETURNED";
  payment: {
    method: "CARD" | "UPI" | "COD" | "NET_BANKING";
    transactionId: string;
    status: "PENDING" | "COMPLETED" | "FAILED";
    amount: number;
  };
  deliverySlot?: {
    date: Date;
    timeWindow: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
  orderNotes?: string;
}
