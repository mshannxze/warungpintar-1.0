import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { suppliers } from "@/db/schema/warung";
import { HttpError, requireRole } from "@/lib/api/auth-guard";
import { handleError, noContent, ok } from "@/lib/api/responses";
import { idParamSchema, supplierUpdateSchema } from "@/lib/api/validators";

interface Params {
    params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
    try {
        const { id } = idParamSchema.parse(await params);
        const [row] = await db
            .select()
            .from(suppliers)
            .where(eq(suppliers.id, id))
            .limit(1);
        if (!row) throw new HttpError(404, "Supplier tidak ditemukan");
        return ok(row);
    } catch (e) {
        return handleError(e);
    }
}

export async function PUT(req: NextRequest, { params }: Params) {
    try {
        await requireRole("owner");
        const { id } = idParamSchema.parse(await params);
        const body = supplierUpdateSchema.parse(await req.json());
        const [row] = await db
            .update(suppliers)
            .set({
                ...body,
                phone: body.phone === undefined ? undefined : (body.phone ?? null),
                address:
                    body.address === undefined ? undefined : (body.address ?? null),
            })
            .where(eq(suppliers.id, id))
            .returning();
        if (!row) throw new HttpError(404, "Supplier tidak ditemukan");
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
            .delete(suppliers)
            .where(eq(suppliers.id, id))
            .returning();
        if (result.length === 0)
            throw new HttpError(404, "Supplier tidak ditemukan");
        return noContent();
    } catch (e) {
        return handleError(e);
    }
}
