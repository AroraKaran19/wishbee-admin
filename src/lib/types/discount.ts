export interface Discount {
  type: "percentage" | "fixed";
  value: number;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
}
