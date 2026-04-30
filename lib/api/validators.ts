import { z } from "zod";

export const idParamSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export const uuidParamSchema = z.object({
    id: z.string().uuid(),
});

const decimalString = z.union([z.string(), z.number()]).transform((v) => {
    const n = typeof v === "string" ? Number(v) : v;
    if (!Number.isFinite(n) || n < 0) {
        throw new Error("Nilai numerik tidak valid");
    }
    return n.toFixed(2);
});

export const categoryCreateSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).nullish(),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

export const productCreateSchema = z.object({
    sku: z.string().min(1).max(64),
    name: z.string().min(1).max(200),
    categoryId: z.number().int().positive().nullish(),
    purchasePrice: decimalString,
    sellingPrice: decimalString,
    unit: z.string().min(1).max(32).default("pcs"),
    currentStock: z.number().int().nonnegative().default(0),
    minStock: z.number().int().nonnegative().default(0),
});

export const productUpdateSchema = productCreateSchema.partial();

export const supplierCreateSchema = z.object({
    name: z.string().min(1).max(150),
    phone: z.string().max(32).nullish(),
    address: z.string().max(500).nullish(),
});

export const supplierUpdateSchema = supplierCreateSchema.partial();

export const transactionItemInput = z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().positive(),
});

export const transactionCreateSchema = z.object({
    items: z.array(transactionItemInput).min(1, "Minimal 1 item"),
    paymentMethod: z.enum(["cash", "qris", "transfer"]),
    notes: z.string().max(500).nullish(),
});

export const stockInItemInput = z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().positive(),
    unitCost: decimalString,
});

export const stockInCreateSchema = z.object({
    supplierId: z.number().int().positive().nullish(),
    receivedDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
    notes: z.string().max(500).nullish(),
    items: z.array(stockInItemInput).min(1, "Minimal 1 item"),
});

export const userCreateSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(8).max(128),
    role: z.enum(["owner", "cashier"]).default("cashier"),
});

export const userUpdateSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    role: z.enum(["owner", "cashier"]).optional(),
    isActive: z.boolean().optional(),
});

export const reportFilterSchema = z.object({
    from: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional(),
    to: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional(),
    period: z.enum(["today", "7d", "30d", "month", "custom"]).optional(),
    cashierId: z.string().optional(),
    categoryId: z.coerce.number().int().positive().optional(),
});

export type TransactionCreate = z.infer<typeof transactionCreateSchema>;
export type StockInCreate = z.infer<typeof stockInCreateSchema>;
export type UserCreate = z.infer<typeof userCreateSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
export type ReportFilter = z.infer<typeof reportFilterSchema>;
