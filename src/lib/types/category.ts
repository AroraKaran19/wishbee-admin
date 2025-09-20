export interface Category {
  _id?: string;
  name: string;
  description: string;
  image?: string;
  slug: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SubCategory {
  _id?: string;
  name: string;
  description: string;
  parentCategoryId?: Category;
  image?: string;
  slug: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
