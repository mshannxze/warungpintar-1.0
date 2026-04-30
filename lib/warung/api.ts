export class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(path, {
        credentials: "include",
        headers: { "Content-Type": "application/json", ...init?.headers },
        ...init,
    });
    if (res.status === 204) return undefined as T;
    const json = await res.json();
    if (!res.ok) throw new ApiError(res.status, json?.error?.message ?? "Terjadi kesalahan");
    return (json as { data: T }).data;
}

// ── Categories ─────────────────────────────────────────────────────────────

export type Category = { id: number; name: string; description?: string | null; createdAt: string };

export const api = {
    categories: {
        list: () => request<Category[]>("/api/categories"),
        create: (body: { name: string; description?: string }) => request<Category>("/api/categories", { method: "POST", body: JSON.stringify(body) }),
        update: (id: number, body: { name?: string; description?: string }) => request<Category>(`/api/categories/${id}`, { method: "PUT", body: JSON.stringify(body) }),
        delete: (id: number) => request<void>(`/api/categories/${id}`, { method: "DELETE" }),
    },

    // ── Products ───────────────────────────────────────────────────────────
    products: {
        list: (params?: { search?: string; categoryId?: number; lowStock?: boolean }) => {
            const q = new URLSearchParams();
            if (params?.search) q.set("search", params.search);
            if (params?.categoryId) q.set("categoryId", String(params.categoryId));
            if (params?.lowStock) q.set("lowStock", "1");
            return request<Product[]>(`/api/products${q.size ? `?${q}` : ""}`);
        },
        getById: (id: number) => request<Product>(`/api/products/${id}`),
        create: (body: ProductCreateInput) => request<Product>("/api/products", { method: "POST", body: JSON.stringify(body) }),
        update: (id: number, body: Partial<ProductCreateInput>) => request<Product>(`/api/products/${id}`, { method: "PUT", body: JSON.stringify(body) }),
        delete: (id: number) => request<void>(`/api/products/${id}`, { method: "DELETE" }),
    },

    // ── Suppliers ──────────────────────────────────────────────────────────
    suppliers: {
        list: () => request<Supplier[]>("/api/suppliers"),
        create: (body: SupplierInput) => request<Supplier>("/api/suppliers", { method: "POST", body: JSON.stringify(body) }),
        update: (id: number, body: Partial<SupplierInput>) => request<Supplier>(`/api/suppliers/${id}`, { method: "PUT", body: JSON.stringify(body) }),
        delete: (id: number) => request<void>(`/api/suppliers/${id}`, { method: "DELETE" }),
    },

    // ── Transactions ───────────────────────────────────────────────────────
    transactions: {
        list: (params?: { from?: string; to?: string; cashierId?: string; limit?: number }) => {
            const q = new URLSearchParams();
            if (params?.from) q.set("from", params.from);
            if (params?.to) q.set("to", params.to);
            if (params?.cashierId) q.set("cashierId", params.cashierId);
            if (params?.limit) q.set("limit", String(params.limit));
            return request<Transaction[]>(`/api/transactions${q.size ? `?${q}` : ""}`);
        },
        getById: (id: string) => request<TransactionDetail>(`/api/transactions/${id}`),
        create: (body: TransactionCreateInput) => request<TransactionDetail>("/api/transactions", { method: "POST", body: JSON.stringify(body) }),
        refund: (id: string) => request<Transaction>(`/api/transactions/${id}/refund`, { method: "POST" }),
    },

    // ── Stock-Ins ──────────────────────────────────────────────────────────
    stockIns: {
        list: (limit?: number) => {
            const q = limit ? `?limit=${limit}` : "";
            return request<StockIn[]>(`/api/stock-ins${q}`);
        },
        getById: (id: string) => request<StockInDetail>(`/api/stock-ins/${id}`),
        create: (body: StockInCreateInput) => request<StockInDetail>("/api/stock-ins", { method: "POST", body: JSON.stringify(body) }),
    },

    // ── Stock Movements ────────────────────────────────────────────────────
    stockMovements: {
        list: (params?: { productId?: number; type?: string; from?: string; to?: string; limit?: number }) => {
            const q = new URLSearchParams();
            if (params?.productId) q.set("productId", String(params.productId));
            if (params?.type) q.set("type", params.type);
            if (params?.from) q.set("from", params.from);
            if (params?.to) q.set("to", params.to);
            if (params?.limit) q.set("limit", String(params.limit));
            return request<StockMovement[]>(`/api/stock-movements${q.size ? `?${q}` : ""}`);
        },
    },

    // ── Users ──────────────────────────────────────────────────────────────
    users: {
        list: () => request<AppUser[]>("/api/users"),
        create: (body: UserCreateInput) => request<AppUser>("/api/users", { method: "POST", body: JSON.stringify(body) }),
        update: (id: string, body: UserUpdateInput) => request<AppUser>(`/api/users/${id}`, { method: "PUT", body: JSON.stringify(body) }),
        delete: (id: string) => request<void>(`/api/users/${id}`, { method: "DELETE" }),
    },

    // ── Reports ────────────────────────────────────────────────────────────
    reports: {
        dashboard: () => request<DashboardReport>("/api/reports/dashboard"),
        sales: (params?: { period?: string; from?: string; to?: string; cashierId?: string; categoryId?: number }) => {
            const q = new URLSearchParams();
            if (params?.period) q.set("period", params.period);
            if (params?.from) q.set("from", params.from);
            if (params?.to) q.set("to", params.to);
            if (params?.cashierId) q.set("cashierId", params.cashierId);
            if (params?.categoryId) q.set("categoryId", String(params.categoryId));
            return request<SalesReport>(`/api/reports/sales${q.size ? `?${q}` : ""}`);
        },
    },
};

// ── Types ───────────────────────────────────────────────────────────────────

export type Product = {
    id: number; sku: string; name: string;
    categoryId: number | null; categoryName: string | null;
    purchasePrice: string; sellingPrice: string;
    unit: string; currentStock: number; minStock: number;
    createdAt: string; updatedAt: string;
};

export type ProductCreateInput = {
    sku: string; name: string; categoryId?: number | null;
    purchasePrice: string | number; sellingPrice: string | number;
    unit?: string; currentStock?: number; minStock?: number;
};

export type Supplier = { id: number; name: string; phone?: string | null; address?: string | null; createdAt: string };
export type SupplierInput = { name: string; phone?: string | null; address?: string | null };

export type PaymentMethod = "cash" | "qris" | "transfer";

export type Transaction = {
    id: string; userId: string; cashierName: string | null;
    totalAmount: string; totalCost: string;
    paymentMethod: PaymentMethod; status: string; createdAt: string;
};

export type TransactionItem = {
    id: number; productId: number; productName: string | null;
    sku: string | null; quantity: number;
    unitPrice: string; unitCost: string; subtotal: string;
};

export type TransactionDetail = Transaction & { items: TransactionItem[] };

export type TransactionCreateInput = {
    items: { productId: number; quantity: number }[];
    paymentMethod: PaymentMethod;
    notes?: string;
};

export type StockIn = {
    id: string; userId: string; supplierId: number | null;
    totalCost: string; receivedDate: string;
    notes: string | null; createdAt: string;
};

export type StockInItem = { id: number; productId: number; productName?: string | null; quantity: number; unitCost: string };
export type StockInDetail = StockIn & { items: StockInItem[] };

export type StockInCreateInput = {
    supplierId?: number | null; receivedDate: string; notes?: string;
    items: { productId: number; quantity: number; unitCost: string | number }[];
};

export type StockMovement = {
    id: number; productId: number; productName: string | null;
    type: string; quantity: number;
    referenceType: string | null; referenceId: string | null;
    notes: string | null; userId: string | null; userName: string | null; createdAt: string;
};

export type AppUser = {
    id: string; name: string; email: string;
    role: "owner" | "cashier"; isActive: boolean; createdAt: string;
};
export type UserCreateInput = { name: string; email: string; password: string; role: "owner" | "cashier" };
export type UserUpdateInput = { name?: string; role?: "owner" | "cashier"; isActive?: boolean };

export type DashboardReport = {
    today: { totalSales: number; totalCost: number; grossProfit: number; transactionCount: number };
    lowStockCount: number;
    lowStock: Product[];
    trend: { day: string; total: string | null; count: number }[];
    topProducts: { productId: number; productName: string | null; sku: string | null; qty: string | null; revenue: string | null }[];
};

export type SalesReport = {
    range: { from: string; to: string };
    summary: { transactionCount: number; totalRevenue: number; totalCost: number; grossProfit: number; margin: number };
    categoryBreakdown: { categoryId: number | null; categoryName: string | null; qty: string | null; revenue: string | null; cost: string | null }[];
    transactions: (Transaction & { cashierName: string | null })[];
};
