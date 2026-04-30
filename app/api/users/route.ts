import { NextRequest } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { user as userTable } from "@/db/schema/auth";
import { auth } from "@/lib/auth";
import { HttpError, requireRole } from "@/lib/api/auth-guard";
import { created, handleError, ok } from "@/lib/api/responses";
import { userCreateSchema } from "@/lib/api/validators";

export async function GET() {
    try {
        await requireRole("owner");
        const rows = await db
            .select({
                id: userTable.id,
                name: userTable.name,
                email: userTable.email,
                role: userTable.role,
                isActive: userTable.isActive,
                createdAt: userTable.createdAt,
            })
            .from(userTable)
            .orderBy(asc(userTable.name));
        return ok(rows);
    } catch (e) {
        return handleError(e);
    }
}

export async function POST(req: NextRequest) {
    try {
        await requireRole("owner");
        const body = userCreateSchema.parse(await req.json());

        const result = await auth.api.signUpEmail({
            body: {
                email: body.email,
                password: body.password,
                name: body.name,
            },
        });

        const userId = result.user?.id;
        if (!userId) {
            throw new HttpError(500, "Gagal membuat akun");
        }
        const [updated] = await db
            .update(userTable)
            .set({ role: body.role, isActive: true })
            .where(eq(userTable.id, userId))
            .returning({
                id: userTable.id,
                name: userTable.name,
                email: userTable.email,
                role: userTable.role,
                isActive: userTable.isActive,
                createdAt: userTable.createdAt,
            });
        return created(updated);
    } catch (e) {
        if (
            e instanceof Error &&
            /already exists|unique/i.test(e.message)
        ) {
            return handleError(new HttpError(409, "Email sudah digunakan"));
        }
        return handleError(e);
    }
}
