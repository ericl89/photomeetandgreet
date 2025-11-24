import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const memberSecret = new TextEncoder().encode(process.env.JWT_MEMBER_SECRET!);
const adminSecret  = new TextEncoder().encode(process.env.JWT_ADMIN_SECRET!);

export default async function middleware(req: NextRequest) {
    const { pathname, search } = req.nextUrl;

    if (pathname.startsWith("/member")) {
        const token = req.cookies.get("access")?.value;
        if (!token) return NextResponse.redirect(new URL("/sign-in", req.url));
        try { await jwtVerify(token, memberSecret); }
        catch { return NextResponse.redirect(new URL("/sign-in", req.url)); }
    }

    if (pathname.startsWith("/admin")) {
        try {
            const token = req.cookies.get("access")?.value;
            if (!token) throw new Error("Invalid token");
            const { payload } = await jwtVerify(token, memberSecret);
            if (payload.memberType !== "SUPER_ADMIN" && payload.memberType !== "GROUP_ADMIN") {
                return NextResponse.redirect(new URL("/login", req.url));
            }
        } catch {
            const url = req.nextUrl.clone();
            url.pathname = "/login";
            url.searchParams.set("redirect", pathname + search);
            return NextResponse.redirect(new URL(url, req.url));
        }
    }

    // CSRF for non-GET
    if (req.method !== "GET") {
        const csrfCookie = req.cookies.get("csrf")?.value;
        const csrfHeader = req.headers.get("x-csrf");
        if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
            return NextResponse.json({ error: "Bad CSRF" }, { status: 403 });
        }
    }
    return NextResponse.next();
}

export const config = { matcher: ['/admin','/admin/((?!api|login|_next/static|_next/image).*)'] };