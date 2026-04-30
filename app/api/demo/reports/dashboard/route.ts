import { NextResponse } from "next/server";

function daysAgo(n: number, h = 10): string {
    const d = new Date();
    d.setDate(d.getDate() - n);
    d.setHours(h, 0, 0, 0);
    return d.toISOString();
}

function dateLabel(daysAgo: number): string {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().slice(0, 10);
}

const LOW_STOCK_PRODUCTS = [
    { id: 2, sku: "MNM-TEH-PUC", name: "Teh Pucuk Harum 350ml", categoryId: 1, categoryName: "Minuman", purchasePrice: "3500", sellingPrice: "5000", unit: "botol", currentStock: 8, minStock: 12, createdAt: daysAgo(90), updatedAt: daysAgo(1) },
    { id: 5, sku: "MR-OREO", name: "Oreo Original 137g", categoryId: 2, categoryName: "Makanan Ringan", purchasePrice: "7500", sellingPrice: "10500", unit: "pcs", currentStock: 4, minStock: 8, createdAt: daysAgo(90), updatedAt: daysAgo(2) },
    { id: 9, sku: "SMB-MIGOR-1L", name: "Minyak Goreng 1L", categoryId: 4, categoryName: "Sembako", purchasePrice: "16000", sellingPrice: "19000", unit: "btl", currentStock: 6, minStock: 10, createdAt: daysAgo(90), updatedAt: daysAgo(3) },
    { id: 12, sku: "MNM-SPRT-390", name: "Sprite 390ml", categoryId: 1, categoryName: "Minuman", purchasePrice: "5000", sellingPrice: "7000", unit: "btl", currentStock: 0, minStock: 6, createdAt: daysAgo(90), updatedAt: daysAgo(4) },
];

const TREND = [
    { day: dateLabel(6), total: "892000", count: 28 },
    { day: dateLabel(5), total: "1105000", count: 34 },
    { day: dateLabel(4), total: "976000", count: 29 },
    { day: dateLabel(3), total: "1342000", count: 41 },
    { day: dateLabel(2), total: "1187000", count: 36 },
    { day: dateLabel(1), total: "1063000", count: 32 },
    { day: dateLabel(0), total: "1245000", count: 37 },
];

const TOP_PRODUCTS = [
    { productId: 6, productName: "Sampoerna Mild 16", sku: "RKK-SMP-MILD", qty: "145", revenue: "4640000" },
    { productId: 1, productName: "Aqua 600ml", sku: "MNM-AQUA-600", qty: "312", revenue: "1248000" },
    { productId: 8, productName: "Beras Premium 5kg", sku: "SMB-BERAS-5KG", qty: "38", revenue: "2850000" },
    { productId: 3, productName: "Kopi Kapal Api Sachet", sku: "MNM-KOP-KAPAL", qty: "210", revenue: "420000" },
    { productId: 4, productName: "Chitato Sapi Panggang 68g", sku: "MR-CHITATO", qty: "87", revenue: "957000" },
];

export async function GET() {
    return NextResponse.json({
        data: {
            today: {
                totalSales: 1245000,
                totalCost: 912000,
                grossProfit: 333000,
                transactionCount: 37,
            },
            lowStockCount: LOW_STOCK_PRODUCTS.length,
            lowStock: LOW_STOCK_PRODUCTS,
            trend: TREND,
            topProducts: TOP_PRODUCTS,
        },
    });
}
