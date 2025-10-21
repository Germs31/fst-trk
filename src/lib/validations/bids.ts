import { z } from "zod";

export const BidItemSchema = z.object({
  type: z.enum(["MATERIAL", "LABOR"]),
  name: z.string().min(1, "Item name is required"),
  quantity: z.number().positive("Quantity must be positive"),
  unitCost: z.number().nonnegative("Unit cost must be 0 or higher"),
});

export const BidSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  customerName: z.string().min(2, "Customer name is required"),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
  address: z.string().optional(),
  clientId: z.string().optional(),
  companyId: z.string().min(1, "Company ID is required"),
  userId: z.string().min(1, "User ID is required"),
  items: z.array(BidItemSchema).nonempty("At least one bid item is required"),
});