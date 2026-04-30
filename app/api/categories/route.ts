import { NextRequest } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema/warung";
import { requireRole } from "@/lib/api/auth-guard";
import { created, handleError, ok } from "@/lib/api/responses";
import { categoryCreateSchema } from "@/lib/api/validators";

export async function GET() {
    try {
        const rows = await db
            .select()
            .from(categories)
            .orderBy(asc(categories.name));
        return ok(rows);
    } catch (e) {
        return handleError(e);
    }
}

export async function POST(req: NextRequest) {
    try {
        await requireRole("owner");
        const body = categoryCreateSchema.parse(await req.json());
        const [row] = await db
            .insert(categories)
            .values({
                name: body.name,
                description: body.description ?? null,
            })
            .returning();
        return created(row);
    } catch (e) {
        return handleError(e);
    }
}
