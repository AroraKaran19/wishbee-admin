export interface Category {
  _id?: string;
  name: string;
  description: string;
  parentCategoryId?: Partial<Category>;
  image?: string;
  slug: string;
  isActive: boolean;
  showOnHomepage: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
