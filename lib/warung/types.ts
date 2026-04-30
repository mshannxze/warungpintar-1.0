export type UserRole = "owner" | "cashier";

export interface AppUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    createdAt: string;
}

export interface Category {
    id: number;
    name: string;
    description?: string;
}

export interface Product {
    id: number;
    sku: string;
    name: string;
    categoryId: number;
    categoryName: string;
    purchasePrice: number;
    sellingPrice: number;
    unit: string;
    currentStock: number;
    minStock: number;
}

export interface Supplier {
    id: number;
    name: string;
    phone?: string;
    address?: string;
}

export type PaymentMethod = "cash" | "qris" | "transfer";
export type TransactionStatus =
    | "draft"
    | "pending"
    | "completed"
    | "cancelled"
    | "refunded";

export interface TransactionItem {
    productId: number;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    unitCost: number;
    subtotal: number;
}

export interface Transaction {
    id: string;
    cashierId: string;
    cashierName: string;
    items: TransactionItem[];
    totalAmount: number;
    totalCost: number;
    paymentMethod: PaymentMethod;
    status: TransactionStatus;
    createdAt: string;
}

export interface StockInItem {
    productId: number;
    productName: string;
    quantity: number;
    unitCost: number;
}

export interface StockIn {
    id: string;
    userId: string;
    userName: string;
    supplierId: number;
    supplierName: string;
    items: StockInItem[];
    totalCost: number;
    receivedDate: string;
    notes?: string;
    createdAt: string;
}
