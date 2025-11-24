import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { eq } from 'drizzle-orm';
import {drizzle} from "drizzle-orm/node-postgres";
import {members} from "@/db/schema";
import {issueAndStoreRotatingRefreshToken, signAccessMember} from "@/lib/auth/member";

const db = drizzle(process.env.DATABASE_URL!);

export async function POST(req: Request) {
    const { emailAddress, password } = await req.json();

    const user = await db.select({userid: members.id,
        passwordHash: members.passwordHash, memberType: members.memberType, role: members.role})
        .from(members)
        .where(eq(members.email, emailAddress))
        .limit(1);

    if (!user || !(await bcrypt.compare(password, user[0].passwordHash))) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const access = await signAccessMember({ sub: user[0].userid.toString(), memberType: user[0].memberType });
    const refresh = await issueAndStoreRotatingRefreshToken(user[0].userid, req); // store hashed token + device info
    const res = NextResponse.json({ ok: true, user: { id: user[0].userid, memberType: user[0].memberType } });

    res.cookies.set("access", access, { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 60*15 });
    res.cookies.set("refresh", refresh, { httpOnly: true, sameSite: "lax", secure: true, path: "/api/auth", maxAge: 60*60*24*30 });
    // Also set a CSRF cookie (non-HTTP-only) with a random token and require it as a header on writes
    res.cookies.set("csrf", crypto.randomUUID(), { sameSite: "lax", secure: true, path: "/" });

    return res;
}