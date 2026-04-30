import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema/warung";
import { requireRole, HttpError } from "@/lib/api/auth-guard";
import { handleError, noContent, ok } from "@/lib/api/responses";
import { categoryUpdateSchema, idParamSchema } from "@/lib/api/validators";

interface Params {
    params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
    try {
        const { id } = idParamSchema.parse(await params);
        const [row] = await db
            .select()
            .from(categories)
            .where(eq(categories.id, id))
            .limit(1);
        if (!row) throw new HttpError(404, "Kategori tidak ditemukan");
        return ok(row);
    } catch (e) {
        return handleError(e);
    }
}

export async function PUT(req: NextRequest, { params }: Params) {
    try {
        await requireRole("owner");
        const { id } = idParamSchema.parse(await params);
        const body = categoryUpdateSchema.parse(await req.json());
        const [row] = await db
            .update(categories)
            .set(body)
            .where(eq(categories.id, id))
            .returning();
        if (!row) throw new HttpError(404, "Kategori tidak ditemukan");
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
            .delete(categories)
            .where(eq(categories.id, id))
            .returning();
        if (result.length === 0)
            throw new HttpError(404, "Kategori tidak ditemukan");
        return noContent();
    } catch (e) {
        return handleError(e);
    }
}
