import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
    products,
    transactionItems,
    transactions,
} from "@/db/schema/warung";
import { user as userTable } from "@/db/schema/auth";
import { getAuthContext, HttpError } from "@/lib/api/auth-guard";
import { handleError, ok } from "@/lib/api/responses";
import { uuidParamSchema } from "@/lib/api/validators";

interface Params {
    params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
    try {
        const ctx = await getAuthContext();
        const { id } = uuidParamSchema.parse(await params);

        const [trx] = await db
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
            .where(eq(transactions.id, id))
            .limit(1);

        if (!trx) throw new HttpError(404, "Transaksi tidak ditemukan");
        if (ctx.role === "cashier" && trx.userId !== ctx.userId) {
            throw new HttpError(403, "Tidak berhak mengakses transaksi ini");
        }

        const items = await db
            .select({
                id: transactionItems.id,
                productId: transactionItems.productId,
                productName: products.name,
                sku: products.sku,
                quantity: transactionItems.quantity,
                unitPrice: transactionItems.unitPrice,
                unitCost: transactionItems.unitCost,
                subtotal: transactionItems.subtotal,
            })
            .from(transactionItems)
            .leftJoin(products, eq(products.id, transactionItems.productId))
            .where(eq(transactionItems.transactionId, id));

        return ok({ ...trx, items });
    } catch (e) {
        return handleError(e);
    }
}
