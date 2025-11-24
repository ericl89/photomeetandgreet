import { cookies } from 'next/headers'
import {unauthorized} from "next/navigation";
import {eq} from "drizzle-orm";
import {memberRefreshTokens, members} from "@/db/schema";
import {issueAndStoreRotatingRefreshToken, signAccessMember} from "@/lib/auth/member";
import {drizzle} from "drizzle-orm/node-postgres";
import crypto from "crypto";
import {NextResponse} from "next/server";

export async function rotateRefresh(req: Request) {
    const cookieStore = await cookies()
    const db = drizzle(process.env.DATABASE_URL!);
    //const raw = getCookie(req, "refresh_member"); // read cookie
    const raw = cookieStore.get("refresh") // read cookie

    if (!raw) throw unauthorized();

    const hashed = crypto.createHash("sha256").update(raw.value).digest("hex");

    const [row] = await db.select({id: memberRefreshTokens.id, memberId: memberRefreshTokens.memberId,
        revokedAt: memberRefreshTokens.revokedAt, expiresAt: memberRefreshTokens.expiresAt})
        .from(memberRefreshTokens).where(eq(memberRefreshTokens.hashedToken, hashed));
    if (!row || row.revokedAt || row.expiresAt < new Date()) throw unauthorized();

    // get member type
    const [m] = await db.select({memberType: members.memberType})
        .from(members)
        .where(eq(members.id, row.memberId))
        .limit(1);

    // revoke old
    await db.update(memberRefreshTokens)
        .set({ revokedAt: new Date(), lastUsedAt: new Date() })
        .where(eq(memberRefreshTokens.id, row.id));

    // issue new
    const newRaw = await issueAndStoreRotatingRefreshToken(row.memberId, req);

    // also create a new short-lived access JWT
    const access = await signAccessMember({ sub: String(row.memberId), memberType: m.memberType });

    return { access, refresh: newRaw };
}