import { NextRequest } from "next/server";
import {
    and,
    count,
    desc,
    eq,
    gte,
    lte,
    sum,
} from "drizzle-orm";
import { db } from "@/db";
import {
    categories,
    products,
    transactionItems,
    transactions,
} from "@/db/schema/warung";
import { user as userTable } from "@/db/schema/auth";
import { requireRole } from "@/lib/api/auth-guard";
import { handleError, ok } from "@/lib/api/responses";
import { reportFilterSchema } from "@/lib/api/validators";

function startOfDay(d: Date) {
    const c = new Date(d);
    c.setHours(0, 0, 0, 0);
    return c;
}

function resolveRange(
    period?: string,
    from?: string,
    to?: string,
): { from: Date; to: Date } {
    const now = new Date();
    if (period === "today") return { from: startOfDay(now), to: now };
    if (period === "7d")
        return {
            from: startOfDay(new Date(now.getTime() - 6 * 86400000)),
            to: now,
        };
    if (period === "30d")
        return {
            from: startOfDay(new Date(now.getTime() - 29 * 86400000)),
            to: now,
        };
    if (period === "month") {
        const f = new Date(now.getFullYear(), now.getMonth(), 1);
        return { from: f, to: now };
    }
    const f = from ? startOfDay(new Date(from)) : startOfDay(new Date(now.getTime() - 6 * 86400000));
    const t = to ? new Date(to) : now;
    if (to) t.setHours(23, 59, 59, 999);
    return { from: f, to: t };
}

export async function GET(req: NextRequest) {
    try {
        await requireRole("owner");
        const url = new URL(req.url);
        const params = reportFilterSchema.parse({
            period: url.searchParams.get("period") ?? undefined,
            from: url.searchParams.get("from") ?? undefined,
            to: url.searchParams.get("to") ?? undefined,
            cashierId: url.searchParams.get("cashierId") ?? undefined,
            categoryId: url.searchParams.get("categoryId") ?? undefined,
        });
        const range = resolveRange(params.period, params.from, params.to);

        const txConditions = [
            eq(transactions.status, "completed"),
            gte(transactions.createdAt, range.from),
            lte(transactions.createdAt, range.to),
        ];
        if (params.cashierId) {
            txConditions.push(eq(transactions.userId, params.cashierId));
        }

        const [agg] = await db
            .select({
                totalRevenue: sum(transactions.totalAmount),
                totalCost: sum(transactions.totalCost),
                count: count(),
            })
            .from(transactions)
            .where(and(...txConditions));

        const items = await db
            .select({
                id: transactions.id,
                createdAt: transactions.createdAt,
                cashierId: transactions.userId,
                cashierName: userTable.name,
                paymentMethod: transactions.paymentMethod,
                totalAmount: transactions.totalAmount,
                totalCost: transactions.totalCost,
            })
            .from(transactions)
            .leftJoin(userTable, eq(userTable.id, transactions.userId))
            .where(and(...txConditions))
            .orderBy(desc(transactions.createdAt));

        let categoryBreakdown: Array<{
            categoryId: number | null;
            categoryName: string | null;
            qty: string | null;
            revenue: string | null;
            cost: string | null;
        }> = [];
        if (params.categoryId === undefined) {
            categoryBreakdown = await db
                .select({
                    categoryId: products.categoryId,
                    categoryName: categories.name,
                    qty: sum(transactionItems.quantity),
                    revenue: sum(transactionItems.subtotal),
                    cost: sum(
                        transactionItems.unitCost,
                    ),
                })
                .from(transactionItems)
                .leftJoin(
                    transactions,
                    eq(transactions.id, transactionItems.transactionId),
                )
                .leftJoin(products, eq(products.id, transactionItems.productId))
                .leftJoin(
                    categories,
                    eq(categories.id, products.categoryId),
                )
                .where(and(...txConditions))
                .groupBy(products.categoryId, categories.name);
        }

        const totalRevenue = Number(agg.totalRevenue ?? 0);
        const totalCost = Number(agg.totalCost ?? 0);

        return ok({
            range: { from: range.from, to: range.to },
            summary: {
                transactionCount: Number(agg.count),
                totalRevenue,
                totalCost,
                grossProfit: totalRevenue - totalCost,
                margin:
                    totalRevenue > 0
                        ? ((totalRevenue - totalCost) / totalRevenue) * 100
                        : 0,
            },
            categoryBreakdown,
            transactions: items,
        });
    } catch (e) {
        return handleError(e);
    }
}
