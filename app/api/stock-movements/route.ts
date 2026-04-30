import { NextRequest } from "next/server";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import { products, stockMovements } from "@/db/schema/warung";
import { user as userTable } from "@/db/schema/auth";
import { getAuthContext } from "@/lib/api/auth-guard";
import { handleError, ok } from "@/lib/api/responses";

export async function GET(req: NextRequest) {
    try {
        await getAuthContext();
        const url = new URL(req.url);
        const productId = url.searchParams.get("productId");
        const type = url.searchParams.get("type");
        const from = url.searchParams.get("from");
        const to = url.searchParams.get("to");
        const limit = Math.min(
            Number(url.searchParams.get("limit") ?? "200"),
            500,
        );

        const conditions = [];
        if (productId) conditions.push(eq(stockMovements.productId, Number(productId)));
        if (type) conditions.push(eq(stockMovements.type, type));
        if (from) conditions.push(gte(stockMovements.createdAt, new Date(from)));
        if (to) {
            const toDate = new Date(to);
            toDate.setHours(23, 59, 59, 999);
            conditions.push(lte(stockMovements.createdAt, toDate));
        }

        const rows = await db
            .select({
                id: stockMovements.id,
                productId: stockMovements.productId,
                productName: products.name,
                type: stockMovements.type,
                quantity: stockMovements.quantity,
                referenceType: stockMovements.referenceType,
                referenceId: stockMovements.referenceId,
                notes: stockMovements.notes,
                userId: stockMovements.userId,
                userName: userTable.name,
                createdAt: stockMovements.createdAt,
            })
            .from(stockMovements)
            .leftJoin(products, eq(products.id, stockMovements.productId))
            .leftJoin(userTable, eq(userTable.id, stockMovements.userId))
            .where(conditions.length ? and(...conditions) : undefined)
            .orderBy(desc(stockMovements.createdAt))
            .limit(limit);
        return ok(rows);
    } catch (e) {
        return handleError(e);
    }
}
