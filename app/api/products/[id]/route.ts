import { NextRequest } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, products } from "@/db/schema/warung";
import { getAuthContext, HttpError, requireRole } from "@/lib/api/auth-guard";
import { handleError, noContent, ok } from "@/lib/api/responses";
import { idParamSchema, productUpdateSchema } from "@/lib/api/validators";

interface Params {
    params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
    try {
        await getAuthContext();
        const { id } = idParamSchema.parse(await params);
        const [row] = await db
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
            .where(eq(products.id, id))
            .limit(1);
        if (!row) throw new HttpError(404, "Produk tidak ditemukan");
        return ok(row);
    } catch (e) {
        return handleError(e);
    }
}

export async function PUT(req: NextRequest, { params }: Params) {
    try {
        await requireRole("owner");
        const { id } = idParamSchema.parse(await params);
        const body = productUpdateSchema.parse(await req.json());
        const [row] = await db
            .update(products)
            .set({
                ...body,
                categoryId:
                    body.categoryId === undefined
                        ? undefined
                        : (body.categoryId ?? null),
                updatedAt: sql`now()`,
            })
            .where(eq(products.id, id))
            .returning();
        if (!row) throw new HttpError(404, "Produk tidak ditemukan");
        return ok(row);
    } catch (e) {
        return handleError(e);
    }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
    try {
        await requireRole("owner");
        const { id } = idParamSchema.parse(await params);
        const result = await db
            .delete(products)
            .where(eq(products.id, id))
            .returning();
        if (result.length === 0)
            throw new HttpError(404, "Produk tidak ditemukan");
        return noContent();
    } catch (e) {
        return handleError(e);
    }
}
