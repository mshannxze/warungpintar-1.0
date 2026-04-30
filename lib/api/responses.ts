import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { HttpError } from "./auth-guard";

export function ok<T>(data: T, init?: ResponseInit) {
    return NextResponse.json({ data }, { status: 200, ...init });
}

export function created<T>(data: T) {
    return NextResponse.json({ data }, { status: 201 });
}

export function noContent() {
    return new NextResponse(null, { status: 204 });
}

export function fail(
    status: number,
    message: string,
    details?: unknown,
) {
    return NextResponse.json({ error: { message, details } }, { status });
}

export function handleError(err: unknown) {
    if (err instanceof HttpError) {
        return fail(err.status, err.message, err.details);
    }
    if (err instanceof ZodError) {
        return fail(422, "Validasi gagal", err.flatten());
    }
    console.error("[api] unhandled error:", err);
    const message = err instanceof Error ? err.message : "Terjadi kesalahan server";
    return fail(500, message);
}
