import { asc, eq, sql } from "drizzle-orm";
import { createClient } from "@supabase/supabase-js";
import { db } from "@/db";
import { user as userTable } from "@/db/schema/auth";
import { type AuthContext, HttpError } from "@/lib/api/auth-guard";
import type { z } from "zod";
import type {
    userCreateSchema,
    userUpdateSchema,
} from "@/lib/api/validators";

type UserCreate = z.infer<typeof userCreateSchema>;
type UserUpdate = z.infer<typeof userUpdateSchema>;

const userSelectFields = {
    id: userTable.id,
    name: userTable.name,
    email: userTable.email,
    role: userTable.role,
    isActive: userTable.isActive,
    createdAt: userTable.createdAt,
};

function createAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } },
    );
}

export class UserService {
    async list() {
        return db
            .select(userSelectFields)
            .from(userTable)
            .orderBy(asc(userTable.name));
    }

    async create(data: UserCreate) {
        const admin = createAdminClient();
        const { data: authData, error } = await admin.auth.admin.createUser({
            email: data.email,
            password: data.password,
            user_metadata: { name: data.name },
            email_confirm: true,
        });

        if (error) {
            if (/already registered|already exists/i.test(error.message)) {
                throw new HttpError(409, "Email sudah digunakan");
            }
            throw new HttpError(500, error.message);
        }

        const [profile] = await db
            .insert(userTable)
            .values({
                id: authData.user.id,
                name: data.name,
                email: data.email,
                emailVerified: true,
                role: data.role,
                isActive: true,
            })
            .returning(userSelectFields);

        return profile;
    }

    async update(id: string, data: UserUpdate, ctx: AuthContext) {
        if (id === ctx.userId && data.role && data.role !== "owner") {
            throw new HttpError(
                400,
                "Tidak bisa menurunkan role akun owner sendiri",
            );
        }
        if (id === ctx.userId && data.isActive === false) {
            throw new HttpError(
                400,
                "Tidak bisa menonaktifkan akun owner sendiri",
            );
        }

        const [row] = await db
            .update(userTable)
            .set({ ...data, updatedAt: sql`now()` })
            .where(eq(userTable.id, id))
            .returning(userSelectFields);
        if (!row) throw new HttpError(404, "Pengguna tidak ditemukan");
        return row;
    }

    async delete(id: string, ctx: AuthContext) {
        if (id === ctx.userId) {
            throw new HttpError(400, "Tidak bisa menghapus akun sendiri");
        }

        const admin = createAdminClient();

        // Verify the user exists in Supabase Auth (source of truth)
        const { data: authData, error: authLookupError } =
            await admin.auth.admin.getUserById(id);
        if (authLookupError || !authData?.user) {
            throw new HttpError(404, "Pengguna tidak ditemukan");
        }

        // Remove from local profile table (ignore if already missing)
        await db.delete(userTable).where(eq(userTable.id, id));

        // Remove from Supabase Auth so the user cannot log back in
        const { error: deleteError } = await admin.auth.admin.deleteUser(id);
        if (deleteError) {
            throw new HttpError(500, "Gagal menghapus pengguna dari sistem autentikasi");
        }
    }
}

export const userService = new UserService();
