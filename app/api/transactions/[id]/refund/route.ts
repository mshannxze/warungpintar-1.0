import { NextRequest } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
    products,
    stockMovements,
    transactionItems,
    transactions,
} from "@/db/schema/warung";
import { HttpError, requireRole } from "@/lib/api/auth-guard";
import { handleError, ok } from "@/lib/api/responses";
import { uuidParamSchema } from "@/lib/api/validators";

interface Params {
    params: Promise<{ id: string }>;
}

export async function POST(_req: NextRequest, { params }: Params) {
    try {
        const ctx = await requireRole("owner");
        const { id } = uuidParamSchema.parse(await params);

        const result = await db.transaction(async (tx) => {
            const [trx] = await tx
                .select()
                .from(transactions)
                .where(eq(transactions.id, id))
                .limit(1);
            if (!trx) throw new HttpError(404, "Transaksi tidak ditemukan");
            if (trx.status !== "completed") {
                throw new HttpError(
                    409,
                    `Transaksi tidak dapat di-refund (status: ${trx.status})`,
                );
            }

            const items = await tx
                .select()
                .from(transactionItems)
                .where(eq(transactionItems.transactionId, id));

            for (const it of items) {
                await tx
                    .update(products)
                    .set({
                        currentStock: sql`${products.currentStock} + ${it.quantity}`,
                        updatedAt: sql`now()`,
                    })
                    .where(eq(products.id, it.productId));
                await tx.insert(stockMovements).values({
                    productId: it.productId,
                    type: "in",
                    quantity: it.quantity,
                    referenceType: "refund",
                    referenceId: trx.id,
                    notes: `Refund oleh ${ctx.email}`,
                    userId: ctx.userId,
                });
            }

            const [updated] = await tx
                .update(transactions)
                .set({ status: "refunded" })
                .where(eq(transactions.id, id))
                .returning();
            return updated;
        });

        return ok(result);
    } catch (e) {
        return handleError(e);
    }
}
