import { NextRequest } from "next/server";
import { and, asc, eq, ilike, lte, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, products } from "@/db/schema/warung";
import { getAuthContext, requireRole } from "@/lib/api/auth-guard";
import { created, handleError, ok } from "@/lib/api/responses";
import { productCreateSchema } from "@/lib/api/validators";

export async function GET(req: NextRequest) {
    try {
        await getAuthContext();
        const url = new URL(req.url);
        const search = url.searchParams.get("search")?.trim();
        const categoryId = url.searchParams.get("categoryId");
        const lowStock = url.searchParams.get("lowStock") === "1";

        const conditions = [];
        if (search) {
            const like = `%${search}%`;
            conditions.push(
                or(ilike(products.name, like), ilike(products.sku, like))!,
            );
        }
        if (categoryId) {
            conditions.push(eq(products.categoryId, Number(categoryId)));
        }
        if (lowStock) {
            conditions.push(lte(products.currentStock, products.minStock));
        }

        const rows = await db
            .select({
                id: products.id,
                sku: products.sku,
                name: products.name,
                categoryId: products.categoryId,
                categoryName: categories.name,
                purchasePrice: products.purchasePrice,
                sellingPrice: products.sellingPrice,
                unit: products.unit,
                currentStock: products.currentStock,
                minStock: products.minStock,
                createdAt: products.createdAt,
                updatedAt: products.updatedAt,
            })
            .from(products)
            .leftJoin(categories, eq(categories.id, products.categoryId))
            .where(conditions.length ? and(...conditions) : undefined)
            .orderBy(asc(products.name));
        return ok(rows);
    } catch (e) {
        return handleError(e);
    }
}

export async function POST(req: NextRequest) {
    try {
        await requireRole("owner");
        const body = productCreateSchema.parse(await req.json());
        const [row] = await db
            .insert(products)
            .values({
                sku: body.sku,
                name: body.name,
                categoryId: body.categoryId ?? null,
                purchasePrice: body.purchasePrice,
                sellingPrice: body.sellingPrice,
                unit: body.unit,
                currentStock: body.currentStock,
                minStock: body.minStock,
                updatedAt: sql`now()`,
            })
            .returning();
        return created(row);
    } catch (e) {
        return handleError(e);
    }
}
