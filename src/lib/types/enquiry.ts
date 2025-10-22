import { Consumer } from ".";

export interface Enquiry {
  _id?: string;
  type: "PAYMENT" | "DELIVERY" | "PRODUCT" | "OTHER";
  user: Consumer;
  message: string;
  images?: string[];
  status: "PENDING" | "RESOLVED" | "CLOSED";
  createdAt?: Date;
  updatedAt?: Date;
}
