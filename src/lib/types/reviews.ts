import { Product } from ".";

export interface Review {
  _id?: string;
  productId: Partial<Product>;
  userId: string;
  rating: number;
  comment?: string;
  createdAt?: Date;
  updatedAt?: Date;
}