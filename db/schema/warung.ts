import {
    pgTable,
    serial,
    text,
    timestamp,
    integer,
    numeric,
    uuid,
    date,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const categories = pgTable("categories", {
    id: serial("id").primaryKey(),
    name: text("name").notNull().unique(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
    id: serial("id").primaryKey(),
    sku: text("sku").notNull().unique(),
    name: text("name").notNull(),
    categoryId: integer("category_id").references(() => categories.id, {
        onDelete: "set null",
    }),
    purchasePrice: numeric("purchase_price", { precision: 12, scale: 2 })
        .notNull()
        .default("0"),
    sellingPrice: numeric("selling_price", { precision: 12, scale: 2 })
        .notNull()
        .default("0"),
    unit: text("unit").notNull().default("pcs"),
    currentStock: integer("current_stock").notNull().default(0),
    minStock: integer("min_stock").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const suppliers = pgTable("suppliers", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    phone: text("phone"),
    address: text("address"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "restrict" }),
    totalAmount: numeric("total_amount", { precision: 14, scale: 2 })
        .notNull()
        .default("0"),
    totalCost: numeric("total_cost", { precision: 14, scale: 2 })
        .notNull()
        .default("0"),
    paymentMethod: text("payment_method").notNull().default("cash"),
    status: text("status").notNull().default("completed"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactionItems = pgTable("transaction_items", {
    id: serial("id").primaryKey(),
    transactionId: uuid("transaction_id")
        .notNull()
        .references(() => transactions.id, { onDelete: "cascade" }),
    productId: integer("product_id")
        .notNull()
        .references(() => products.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
    unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
    unitCost: numeric("unit_cost", { precision: 12, scale: 2 }).notNull(),
    subtotal: numeric("subtotal", { precision: 14, scale: 2 }).notNull(),
});

export const stockIns = pgTable("stock_ins", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "restrict" }),
    supplierId: integer("supplier_id").references(() => suppliers.id, {
        onDelete: "set null",
    }),
    totalCost: numeric("total_cost", { precision: 14, scale: 2 })
        .notNull()
        .default("0"),
    receivedDate: date("received_date").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const stockInItems = pgTable("stock_in_items", {
    id: serial("id").primaryKey(),
    stockInId: uuid("stock_in_id")
        .notNull()
        .references(() => stockIns.id, { onDelete: "cascade" }),
    productId: integer("product_id")
        .notNull()
        .references(() => products.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
    unitCost: numeric("unit_cost", { precision: 12, scale: 2 }).notNull(),
});

export const stockMovements = pgTable("stock_movements", {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
        .notNull()
        .references(() => products.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    quantity: integer("quantity").notNull(),
    referenceType: text("reference_type"),
    referenceId: uuid("reference_id"),
    notes: text("notes"),
    userId: text("user_id").references(() => user.id, {
        onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
