import { NextResponse } from "next/server";

const DEMO_CATEGORIES = [
    { id: 1, name: "Minuman", description: "Air mineral, teh, kopi, soft drink", createdAt: "2025-01-01T00:00:00.000Z" },
    { id: 2, name: "Makanan Ringan", description: "Snack, biskuit, keripik", createdAt: "2025-01-01T00:00:00.000Z" },
    { id: 3, name: "Rokok", description: "Aneka rokok kretek dan filter", createdAt: "2025-01-01T00:00:00.000Z" },
    { id: 4, name: "Sembako", description: "Beras, gula, minyak, tepung", createdAt: "2025-01-01T00:00:00.000Z" },
    { id: 5, name: "Kebutuhan Rumah", description: "Sabun, deterjen, sampo", createdAt: "2025-01-01T00:00:00.000Z" },
];

export async function GET() {
    return NextResponse.json({ data: DEMO_CATEGORIES });
}
