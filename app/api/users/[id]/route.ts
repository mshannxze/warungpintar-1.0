import { NextRequest } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { user as userTable } from "@/db/schema/auth";
import { HttpError, requireRole } from "@/lib/api/auth-guard";
import { handleError, noContent, ok } from "@/lib/api/responses";
import { userUpdateSchema } from "@/lib/api/validators";

interface Params {
    params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: Params) {
    try {
        const ctx = await requireRole("owner");
        const { id } = await params;
        const body = userUpdateSchema.parse(await req.json());

        if (id === ctx.userId && body.role && body.role !== "owner") {
            throw new HttpError(
                400,
                "Tidak bisa menurunkan role akun owner sendiri",
            );
        }
        if (id === ctx.userId && body.isActive === false) {
            throw new HttpError(
                400,
                "Tidak bisa menonaktifkan akun owner sendiri",
            );
        }

        const [row] = await db
            .update(userTable)
            .set({ ...body, updatedAt: sql`now()` })
            .where(eq(userTable.id, id))
            .returning({
                id: userTable.id,
                name: userTable.name,
                email: userTable.email,
                role: userTable.role,
                isActive: userTable.isActive,
                createdAt: userTable.createdAt,
            });
        if (!row) throw new HttpError(404, "Pengguna tidak ditemukan");
        return ok(row);
    } catch (e) {
        return handleError(e);
    }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
    try {
        const ctx = await requireRole("owner");
        const { id } = await params;
        if (id === ctx.userId) {
            throw new HttpError(400, "Tidak bisa menghapus akun sendiri");
        }
        const result = await db
            .delete(userTable)
            .where(eq(userTable.id, id))
            .returning();
        if (result.length === 0)
            throw new HttpError(404, "Pengguna tidak ditemukan");
        return noContent();
    } catch (e) {
        return handleError(e);
    }
}
