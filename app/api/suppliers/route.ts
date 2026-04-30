import { NextRequest } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { suppliers } from "@/db/schema/warung";
import { getAuthContext, requireRole } from "@/lib/api/auth-guard";
import { created, handleError, ok } from "@/lib/api/responses";
import { supplierCreateSchema } from "@/lib/api/validators";

export async function GET() {
    try {
        await getAuthContext();
        const rows = await db
            .select()
            .from(suppliers)
            .orderBy(asc(suppliers.name));
        return ok(rows);
    } catch (e) {
        return handleError(e);
    }
}

export async function POST(req: NextRequest) {
    try {
        await requireRole("owner");
        const body = supplierCreateSchema.parse(await req.json());
        const [row] = await db
            .insert(suppliers)
            .values({
                name: body.name,
                phone: body.phone ?? null,
                address: body.address ?? null,
            })
            .returning();
        return created(row);
    } catch (e) {
        return handleError(e);
    }
}
