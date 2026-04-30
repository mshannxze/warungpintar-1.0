import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = [
    "/dashboard",
    "/products",
    "/pos",
    "/stock-in",
    "/transactions",
    "/reports",
    "/users",
];

const PUBLIC_PREFIXES = ["/demo"];

export async function middleware(req: NextRequest) {
    const res = NextResponse.next({ request: req });

    const { pathname } = req.nextUrl;

    const isPublicDemo = PUBLIC_PREFIXES.some(
        (p) => pathname === p || pathname.startsWith(`${p}/`),
    );
    if (isPublicDemo) return res;

    const isProtected = PROTECTED_PREFIXES.some(
        (p) => pathname === p || pathname.startsWith(`${p}/`),
    );
    if (!isProtected) return res;

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return req.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        req.cookies.set(name, value)
                    );
                    cookiesToSet.forEach(({ name, value, options }) =>
                        res.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        const url = req.nextUrl.clone();
        url.pathname = "/sign-in";
        url.searchParams.set("redirect", pathname);
        return NextResponse.redirect(url);
    }

    return res;
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
