import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user as userTable } from "@/db/schema/auth";
import { createClient } from "@/lib/supabase-server";
import { HttpError } from "@/lib/api/auth-guard";
import { handleError, ok } from "@/lib/api/responses";

export async function GET() {
    try {
        const supabase = await createClient();
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session) throw new HttpError(401, "Tidak terautentikasi");

        const [profile] = await db
            .select()
            .from(userTable)
            .where(eq(userTable.id, session.user.id));

        if (!profile) throw new HttpError(404, "Profil pengguna tidak ditemukan");

        return ok(profile);
    } catch (e) {
        return handleError(e);
    }
}

export async function POST() {
    try {
        const supabase = await createClient();
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session) throw new HttpError(401, "Tidak terautentikasi");

        const userId = session.user.id;
        const [existing] = await db
            .select()
            .from(userTable)
            .where(eq(userTable.id, userId));

        if (existing) return ok(existing);

        const [profile] = await db
            .insert(userTable)
            .values({
                id: userId,
                name:
                    (session.user.user_metadata?.name as string) ||
                    session.user.email!,
                email: session.user.email!,
                emailVerified: !!session.user.email_confirmed_at,
                role: "cashier",
                isActive: true,
            })
            .returning();

        return ok(profile);
    } catch (e) {
        return handleError(e);
    }
}
