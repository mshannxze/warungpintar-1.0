import { NextResponse } from "next/server";

const DEMO_PRODUCTS: Record<number, { name: string; sku: string; sellingPrice: string; purchasePrice: string }> = {
    1: { name: "Aqua 600ml", sku: "MNM-AQUA-600", sellingPrice: "4000", purchasePrice: "2500" },
    2: { name: "Teh Pucuk Harum 350ml", sku: "MNM-TEH-PUC", sellingPrice: "5000", purchasePrice: "3500" },
    3: { name: "Kopi Kapal Api Sachet", sku: "MNM-KOP-KAPAL", sellingPrice: "2000", purchasePrice: "1200" },
    4: { name: "Chitato Sapi Panggang 68g", sku: "MR-CHITATO", sellingPrice: "11000", purchasePrice: "8000" },
    5: { name: "Oreo Original 137g", sku: "MR-OREO", sellingPrice: "10500", purchasePrice: "7500" },
    6: { name: "Sampoerna Mild 16", sku: "RKK-SMP-MILD", sellingPrice: "32000", purchasePrice: "28000" },
    7: { name: "Djarum Super 12", sku: "RKK-DJI-SMR", sellingPrice: "28000", purchasePrice: "24000" },
    8: { name: "Beras Premium 5kg", sku: "SMB-BERAS-5KG", sellingPrice: "75000", purchasePrice: "65000" },
    9: { name: "Minyak Goreng 1L", sku: "SMB-MIGOR-1L", sellingPrice: "19000", purchasePrice: "16000" },
    10: { name: "Sabun Lifebuoy 75g", sku: "RT-SBN-LIFEBUOY", sellingPrice: "5500", purchasePrice: "3800" },
    11: { name: "Detergen Sachet Rinso", sku: "RT-DETJN", sellingPrice: "2500", purchasePrice: "1500" },
    12: { name: "Sprite 390ml", sku: "MNM-SPRT-390", sellingPrice: "7000", purchasePrice: "5000" },
};

export async function POST(req: Request) {
    const body = await req.json();
    const items: { productId: number; quantity: number }[] = body.items ?? [];
    const paymentMethod: string = body.paymentMethod ?? "cash";

    let totalAmount = 0;
    let totalCost = 0;

    const transactionItems = items.map((item, i) => {
        const product = DEMO_PRODUCTS[item.productId];
        const unitPrice = product ? Number(product.sellingPrice) : 0;
        const unitCost = product ? Number(product.purchasePrice) : 0;
        const subtotal = unitPrice * item.quantity;
        totalAmount += subtotal;
        totalCost += unitCost * item.quantity;
        return {
            id: i + 1,
            productId: item.productId,
            productName: product?.name ?? null,
            sku: product?.sku ?? null,
            quantity: item.quantity,
            unitPrice: String(unitPrice),
            unitCost: String(unitCost),
            subtotal: String(subtotal),
        };
    });

    const demoId = `demo-${Date.now().toString(36)}`;

    return NextResponse.json({
        data: {
            id: demoId,
            userId: "u-demo-cashier",
            cashierName: "Demo Kasir",
            totalAmount: String(totalAmount),
            totalCost: String(totalCost),
            paymentMethod,
            status: "completed",
            createdAt: new Date().toISOString(),
            items: transactionItems,
        },
    }, { status: 201 });
}
