import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export type Role = "owner" | "cashier";

export interface AuthContext {
    userId: string;
    email: string;
    name: string;
    role: Role;
    isActive: boolean;
}

export class HttpError extends Error {
    constructor(
        public status: number,
        message: string,
        public details?: unknown,
    ) {
        super(message);
    }
}

export async function getAuthContext(): Promise<AuthContext> {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) {
        throw new HttpError(401, "Tidak terautentikasi");
    }
    const u = session.user as typeof session.user & {
        role?: string;
        isActive?: boolean;
    };
    if (u.isActive === false) {
        throw new HttpError(403, "Akun dinonaktifkan");
    }
    const role = (u.role as Role) ?? "cashier";
    return {
        userId: u.id,
        email: u.email,
        name: u.name,
        role,
        isActive: u.isActive ?? true,
    };
}

export async function requireRole(...roles: Role[]): Promise<AuthContext> {
    const ctx = await getAuthContext();
    if (!roles.includes(ctx.role)) {
        throw new HttpError(
            403,
            `Akses ditolak. Membutuhkan role: ${roles.join(", ")}`,
        );
    }
    return ctx;
}
