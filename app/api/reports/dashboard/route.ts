import {
    and,
    asc,
    count,
    desc,
    eq,
    gte,
    lte,
    sql,
    sum,
} from "drizzle-orm";
import { db } from "@/db";
import {
    products,
    transactionItems,
    transactions,
} from "@/db/schema/warung";
import { getAuthContext } from "@/lib/api/auth-guard";
import { handleError, ok } from "@/lib/api/responses";

function startOfDay(d: Date) {
    const c = new Date(d);
    c.setHours(0, 0, 0, 0);
    return c;
}

export async function GET() {
    try {
        await getAuthContext();
        const now = new Date();
        const todayStart = startOfDay(now);
        const weekStart = startOfDay(new Date(now.getTime() - 6 * 86400000));

        const [todayAgg] = await db
            .select({
                totalAmount: sum(transactions.totalAmount),
                totalCost: sum(transactions.totalCost),
                count: count(),
            })
            .from(transactions)
            .where(
                and(
                    eq(transactions.status, "completed"),
                    gte(transactions.createdAt, todayStart),
                    lte(transactions.createdAt, now),
                ),
            );

        const lowStock = await db
            .select({
                id: products.id,
                sku: products.sku,
                name: products.name,
                currentStock: products.currentStock,
                minStock: products.minStock,
                unit: products.unit,
            })
            .from(products)
            .where(lte(products.currentStock, products.minStock))
            .orderBy(asc(products.currentStock))
            .limit(20);

        const trend = await db
            .select({
                day: sql<string>`to_char(${transactions.createdAt} AT TIME ZONE 'UTC', 'YYYY-MM-DD')`,
                total: sum(transactions.totalAmount),
                count: count(),
            })
            .from(transactions)
            .where(
                and(
                    eq(transactions.status, "completed"),
                    gte(transactions.createdAt, weekStart),
                ),
            )
            .groupBy(
                sql`to_char(${transactions.createdAt} AT TIME ZONE 'UTC', 'YYYY-MM-DD')`,
            )
            .orderBy(
                sql`to_char(${transactions.createdAt} AT TIME ZONE 'UTC', 'YYYY-MM-DD')`,
            );

        const topProducts = await db
            .select({
                productId: transactionItems.productId,
                productName: products.name,
                sku: products.sku,
                qty: sum(transactionItems.quantity),
                revenue: sum(transactionItems.subtotal),
            })
            .from(transactionItems)
            .leftJoin(
                transactions,
                eq(transactions.id, transactionItems.transactionId),
            )
            .leftJoin(products, eq(products.id, transactionItems.productId))
            .where(
                and(
                    eq(transactions.status, "completed"),
                    gte(transactions.createdAt, weekStart),
                ),
            )
            .groupBy(
                transactionItems.productId,
                products.name,
                products.sku,
            )
            .orderBy(desc(sum(transactionItems.quantity)))
            .limit(5);

        const totalAmount = Number(todayAgg.totalAmount ?? 0);
        const totalCost = Number(todayAgg.totalCost ?? 0);

        return ok({
            today: {
                totalSales: totalAmount,
                totalCost,
                grossProfit: totalAmount - totalCost,
                transactionCount: Number(todayAgg.count),
            },
            lowStockCount: lowStock.length,
            lowStock,
            trend,
            topProducts,
        });
    } catch (e) {
        return handleError(e);
    }
}
