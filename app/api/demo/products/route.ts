import { NextResponse } from "next/server";

const DEMO_PRODUCTS = [
    { id: 1, sku: "MNM-AQUA-600", name: "Aqua 600ml", categoryId: 1, categoryName: "Minuman", purchasePrice: "2500", sellingPrice: "4000", unit: "botol", currentStock: 48, minStock: 12, createdAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-01-01T00:00:00.000Z" },
    { id: 2, sku: "MNM-TEH-PUC", name: "Teh Pucuk Harum 350ml", categoryId: 1, categoryName: "Minuman", purchasePrice: "3500", sellingPrice: "5000", unit: "botol", currentStock: 8, minStock: 12, createdAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-01-01T00:00:00.000Z" },
    { id: 3, sku: "MNM-KOP-KAPAL", name: "Kopi Kapal Api Sachet", categoryId: 1, categoryName: "Minuman", purchasePrice: "1200", sellingPrice: "2000", unit: "sachet", currentStock: 120, minStock: 30, createdAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-01-01T00:00:00.000Z" },
    { id: 4, sku: "MR-CHITATO", name: "Chitato Sapi Panggang 68g", categoryId: 2, categoryName: "Makanan Ringan", purchasePrice: "8000", sellingPrice: "11000", unit: "pcs", currentStock: 22, minStock: 10, createdAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-01-01T00:00:00.000Z" },
    { id: 5, sku: "MR-OREO", name: "Oreo Original 137g", categoryId: 2, categoryName: "Makanan Ringan", purchasePrice: "7500", sellingPrice: "10500", unit: "pcs", currentStock: 4, minStock: 8, createdAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-01-01T00:00:00.000Z" },
    { id: 6, sku: "RKK-SMP-MILD", name: "Sampoerna Mild 16", categoryId: 3, categoryName: "Rokok", purchasePrice: "28000", sellingPrice: "32000", unit: "bks", currentStock: 35, minStock: 20, createdAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-01-01T00:00:00.000Z" },
    { id: 7, sku: "RKK-DJI-SMR", name: "Djarum Super 12", categoryId: 3, categoryName: "Rokok", purchasePrice: "24000", sellingPrice: "28000", unit: "bks", currentStock: 14, minStock: 15, createdAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-01-01T00:00:00.000Z" },
    { id: 8, sku: "SMB-BERAS-5KG", name: "Beras Premium 5kg", categoryId: 4, categoryName: "Sembako", purchasePrice: "65000", sellingPrice: "75000", unit: "sak", currentStock: 18, minStock: 5, createdAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-01-01T00:00:00.000Z" },
    { id: 9, sku: "SMB-MIGOR-1L", name: "Minyak Goreng 1L", categoryId: 4, categoryName: "Sembako", purchasePrice: "16000", sellingPrice: "19000", unit: "btl", currentStock: 6, minStock: 10, createdAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-01-01T00:00:00.000Z" },
    { id: 10, sku: "RT-SBN-LIFEBUOY", name: "Sabun Lifebuoy 75g", categoryId: 5, categoryName: "Kebutuhan Rumah", purchasePrice: "3800", sellingPrice: "5500", unit: "pcs", currentStock: 26, minStock: 12, createdAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-01-01T00:00:00.000Z" },
    { id: 11, sku: "RT-DETJN", name: "Detergen Sachet Rinso", categoryId: 5, categoryName: "Kebutuhan Rumah", purchasePrice: "1500", sellingPrice: "2500", unit: "sachet", currentStock: 60, minStock: 25, createdAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-01-01T00:00:00.000Z" },
    { id: 12, sku: "MNM-SPRT-390", name: "Sprite 390ml", categoryId: 1, categoryName: "Minuman", purchasePrice: "5000", sellingPrice: "7000", unit: "btl", currentStock: 0, minStock: 6, createdAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-01-01T00:00:00.000Z" },
];

export async function GET(req: Request) {
    const url = new URL(req.url);
    const search = url.searchParams.get("search")?.toLowerCase();
    const categoryId = url.searchParams.get("categoryId");
    const lowStock = url.searchParams.get("lowStock") === "1";

    let data = DEMO_PRODUCTS;
    if (search) data = data.filter((p) => p.name.toLowerCase().includes(search) || p.sku.toLowerCase().includes(search));
    if (categoryId) data = data.filter((p) => p.categoryId === Number(categoryId));
    if (lowStock) data = data.filter((p) => p.currentStock <= p.minStock);

    return NextResponse.json({ data });
}
