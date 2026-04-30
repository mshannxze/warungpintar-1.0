import type { Category, Product, DashboardReport, TransactionDetail, PaymentMethod } from "./api";

class DemoApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}

async function demoRequest<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(path, {
        headers: { "Content-Type": "application/json", ...init?.headers },
        ...init,
    });
    if (res.status === 204) return undefined as T;
    const json = await res.json();
    if (!res.ok) throw new DemoApiError(res.status, json?.error?.message ?? "Terjadi kesalahan");
    return (json as { data: T }).data;
}

export const demoApi = {
    categories: {
        list: () => demoRequest<Category[]>("/api/demo/categories"),
    },
    products: {
        list: (params?: { search?: string; categoryId?: number; lowStock?: boolean }) => {
            const q = new URLSearchParams();
            if (params?.search) q.set("search", params.search);
            if (params?.categoryId) q.set("categoryId", String(params.categoryId));
            if (params?.lowStock) q.set("lowStock", "1");
            return demoRequest<Product[]>(`/api/demo/products${q.size ? `?${q}` : ""}`);
        },
    },
    reports: {
        dashboard: () => demoRequest<DashboardReport>("/api/demo/reports/dashboard"),
    },
    transactions: {
        create: (body: { items: { productId: number; quantity: number }[]; paymentMethod: PaymentMethod }) =>
            demoRequest<TransactionDetail>("/api/demo/transactions", {
                method: "POST",
                body: JSON.stringify(body),
            }),
    },
};
