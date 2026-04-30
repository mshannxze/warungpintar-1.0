import { NextRequest } from "next/server";
import { and, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import {
    products,
    stockMovements,
    transactionItems,
    transactions,
} from "@/db/schema/warung";
import { user as userTable } from "@/db/schema/auth";
import { getAuthContext, HttpError } from "@/lib/api/auth-guard";
import { created, handleError, ok } from "@/lib/api/responses";
import { transactionCreateSchema } from "@/lib/api/validators";

export async function GET(req: NextRequest) {
    try {
        const ctx = await getAuthContext();
        const url = new URL(req.url);
        const from = url.searchParams.get("from");
        const to = url.searchParams.get("to");
        const cashierId = url.searchParams.get("cashierId");
        const limit = Math.min(
            Number(url.searchParams.get("limit") ?? "100"),
            500,
        );

        const conditions = [];
        if (from) conditions.push(gte(transactions.createdAt, new Date(from)));
        if (to) {
            const toDate = new Date(to);
            toDate.setHours(23, 59, 59, 999);
            conditions.push(lte(transactions.createdAt, toDate));
        }
        if (cashierId) {
            conditions.push(eq(transactions.userId, cashierId));
        } else if (ctx.role === "cashier") {
            conditions.push(eq(transactions.userId, ctx.userId));
        }

        const rows = await db
            .select({
                id: transactions.id,
                userId: transactions.userId,
                cashierName: userTable.name,
                totalAmount: transactions.totalAmount,
                totalCost: transactions.totalCost,
                paymentMethod: transactions.paymentMethod,
                status: transactions.status,
                createdAt: transactions.createdAt,
            })
            .from(transactions)
            .leftJoin(userTable, eq(userTable.id, transactions.userId))
            .where(conditions.length ? and(...conditions) : undefined)
            .orderBy(desc(transactions.createdAt))
            .limit(limit);

        return ok(rows);
    } catch (e) {
        return handleError(e);
    }
}

export async function POST(req: NextRequest) {
    try {
        const ctx = await getAuthContext();
        const body = transactionCreateSchema.parse(await req.json());

        const ids = Array.from(new Set(body.items.map((i) => i.productId)));
        const result = await db.transaction(async (tx) => {
            const prodRows = await tx
                .select()
                .from(products)
                .where(inArray(products.id, ids));
            const prodMap = new Map(prodRows.map((p) => [p.id, p]));

            for (const it of body.items) {
                const p = prodMap.get(it.productId);
                if (!p) {
                    throw new HttpError(
                        404,
                        `Produk #${it.productId} tidak ditemukan`,
                    );
                }
                if (p.currentStock < it.quantity) {
                    throw new HttpError(
                        409,
                        `Stok ${p.name} tidak cukup (tersedia ${p.currentStock}, diminta ${it.quantity})`,
                    );
                }
            }

            let totalAmount = 0;
            let totalCost = 0;
            const itemRows = body.items.map((it) => {
                const p = prodMap.get(it.productId)!;
                const unitPrice = Number(p.sellingPrice);
                const unitCost = Number(p.purchasePrice);
                const subtotal = unitPrice * it.quantity;
                totalAmount += subtotal;
                totalCost += unitCost * it.quantity;
                return {
                    productId: p.id,
                    quantity: it.quantity,
                    unitPrice: unitPrice.toFixed(2),
                    unitCost: unitCost.toFixed(2),
                    subtotal: subtotal.toFixed(2),
                };
            });

            const [trx] = await tx
                .insert(transactions)
                .values({
                    userId: ctx.userId,
                    totalAmount: totalAmount.toFixed(2),
                    totalCost: totalCost.toFixed(2),
                    paymentMethod: body.paymentMethod,
                    status: "completed",
                })
                .returning();

            await tx.insert(transactionItems).values(
                itemRows.map((r) => ({
                    transactionId: trx.id,
                    ...r,
                })),
            );

            for (const it of body.items) {
                await tx
                    .update(products)
                    .set({
                        currentStock: sql`${products.currentStock} - ${it.quantity}`,
                        updatedAt: sql`now()`,
                    })
                    .where(eq(products.id, it.productId));
                await tx.insert(stockMovements).values({
                    productId: it.productId,
                    type: "out",
                    quantity: it.quantity,
                    referenceType: "transaction",
                    referenceId: trx.id,
                    notes: body.notes ?? null,
                    userId: ctx.userId,
                });
            }

            return { ...trx, items: itemRows };
        });

        return created(result);
    } catch (e) {
        return handleError(e);
    }
}
