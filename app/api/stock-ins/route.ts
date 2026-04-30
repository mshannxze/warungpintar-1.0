import { NextRequest } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
    products,
    stockInItems,
    stockIns,
    stockMovements,
    suppliers,
} from "@/db/schema/warung";
import { user as userTable } from "@/db/schema/auth";
import { getAuthContext, HttpError } from "@/lib/api/auth-guard";
import { created, handleError, ok } from "@/lib/api/responses";
import { stockInCreateSchema } from "@/lib/api/validators";

export async function GET(req: NextRequest) {
    try {
        await getAuthContext();
        const url = new URL(req.url);
        const limit = Math.min(
            Number(url.searchParams.get("limit") ?? "100"),
            500,
        );
        const rows = await db
            .select({
                id: stockIns.id,
                userId: stockIns.userId,
                userName: userTable.name,
                supplierId: stockIns.supplierId,
                supplierName: suppliers.name,
                totalCost: stockIns.totalCost,
                receivedDate: stockIns.receivedDate,
                notes: stockIns.notes,
                createdAt: stockIns.createdAt,
            })
            .from(stockIns)
            .leftJoin(userTable, eq(userTable.id, stockIns.userId))
            .leftJoin(suppliers, eq(suppliers.id, stockIns.supplierId))
            .orderBy(desc(stockIns.createdAt))
            .limit(limit);
        return ok(rows);
    } catch (e) {
        return handleError(e);
    }
}

export async function POST(req: NextRequest) {
    try {
        const ctx = await getAuthContext();
        const body = stockInCreateSchema.parse(await req.json());

        const result = await db.transaction(async (tx) => {
            if (body.supplierId) {
                const [sup] = await tx
                    .select({ id: suppliers.id })
                    .from(suppliers)
                    .where(eq(suppliers.id, body.supplierId))
                    .limit(1);
                if (!sup) throw new HttpError(404, "Supplier tidak ditemukan");
            }

            let totalCost = 0;
            for (const it of body.items) {
                const [p] = await tx
                    .select({ id: products.id })
                    .from(products)
                    .where(eq(products.id, it.productId))
                    .limit(1);
                if (!p) {
                    throw new HttpError(
                        404,
                        `Produk #${it.productId} tidak ditemukan`,
                    );
                }
                totalCost += Number(it.unitCost) * it.quantity;
            }

            const [header] = await tx
                .insert(stockIns)
                .values({
                    userId: ctx.userId,
                    supplierId: body.supplierId ?? null,
                    totalCost: totalCost.toFixed(2),
                    receivedDate: body.receivedDate,
                    notes: body.notes ?? null,
                })
                .returning();

            await tx.insert(stockInItems).values(
                body.items.map((it) => ({
                    stockInId: header.id,
                    productId: it.productId,
                    quantity: it.quantity,
                    unitCost: it.unitCost,
                })),
            );

            for (const it of body.items) {
                await tx
                    .update(products)
                    .set({
                        currentStock: sql`${products.currentStock} + ${it.quantity}`,
                        purchasePrice: it.unitCost,
                        updatedAt: sql`now()`,
                    })
                    .where(eq(products.id, it.productId));
                await tx.insert(stockMovements).values({
                    productId: it.productId,
                    type: "in",
                    quantity: it.quantity,
                    referenceType: "stock_in",
                    referenceId: header.id,
                    notes: body.notes ?? null,
                    userId: ctx.userId,
                });
            }

            return header;
        });

        return created(result);
    } catch (e) {
        return handleError(e);
    }
}
