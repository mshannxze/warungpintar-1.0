import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PROTECTED_PREFIXES = [
    "/dashboard",
    "/products",
    "/pos",
    "/stock-in",
    "/transactions",
    "/reports",
    "/users",
];

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const isProtected = PROTECTED_PREFIXES.some(
        (p) => pathname === p || pathname.startsWith(`${p}/`),
    );
    if (!isProtected) return NextResponse.next();

    const sessionCookie = getSessionCookie(req);
    if (!sessionCookie) {
        const url = req.nextUrl.clone();
        url.pathname = "/sign-in";
        url.searchParams.set("redirect", pathname);
        return NextResponse.redirect(url);
    }
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/products/:path*",
        "/pos/:path*",
        "/stock-in/:path*",
        "/transactions/:path*",
        "/reports/:path*",
        "/users/:path*",
    ],
};
