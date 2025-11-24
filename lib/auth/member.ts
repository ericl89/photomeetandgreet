import crypto from "crypto";
import {drizzle} from "drizzle-orm/node-postgres";
import { eq } from 'drizzle-orm';
import {memberRefreshTokens, members} from "@/db/schema";
import {createHash} from "node:crypto";
import {jwtVerify, SignJWT} from "jose";
import {AccessPayload, MemberIdentity, MemberType} from "@/app/types";


const db = drizzle(process.env.DATABASE_URL!);
const MEMBER_JWT_SECRET = new TextEncoder().encode(process.env.JWT_MEMBER_SECRET!);

// export async function fetchWithAuth(input: RequestInfo, init?: RequestInit) {
//     // First attempt with current access cookie
//     let res = await fetch(input, init);
//     if (res.status !== 401) return res;
//
//     // Try to refresh once
//     const refreshed = await fetch("/api/member/auth/refresh", {
//         method: "POST",
//         headers: { "x-csrf": getCsrf() }, // enforce CSRF
//     });
//
//     if (!refreshed.ok) return res; // still 401 — user must re-login
//
//     // Retry original request after successful refresh
//     res = await fetch(input, init);
//     return res;
// }

// function getCsrf() {
//     const m = document.cookie.match(/\bcsrf=([^;]+)/);
//     return m ? decodeURIComponent(m[1]) : "";
// }

export async function signAccessMember(payload: AccessPayload) {
    return await new SignJWT({ ...payload, realm: "user" })
        .setProtectedHeader({ alg: "HS256", typ: "JWT" })
        .setIssuer(process.env.ISSUER!)
        .setAudience(process.env.AUDIENCE!)
        .setIssuedAt()
        .setExpirationTime(process.env.JWT_EXPIRES_IN!)
        .sign(MEMBER_JWT_SECRET);
}

export async function issueAndStoreRotatingRefreshToken(userId: number, req: Request) {
    const raw = crypto.randomBytes(32).toString("base64url");
    const hashed = crypto.createHash("sha256").update(raw).digest("hex");
    const {ua, ipHash} = clientMeta(req);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await db.insert(memberRefreshTokens).values({
        memberId: userId,
        hashedToken: hashed,
        userAgent: ua,
        ipHash,
        expiresAt,
    });

    return raw; // set in httpOnly cookie
}

export async function rotateMemberRefresh(req: Request) {
    const raw = readCookie(req, "refresh_member");
    if (!raw) throw Object.assign(new Error("Missing refresh"), { status: 401 });

    const hashed = sha256(raw);
    const [row] = await db.select().from(memberRefreshTokens)
        .where(eq(memberRefreshTokens.hashedToken, hashed)).limit(1);
    if (!row || row.revokedAt || row.expiresAt < new Date()) {
        throw Object.assign(new Error("Invalid refresh"), { status: 401 });
    }

    // revoke old
    await db.update(memberRefreshTokens)
        .set({ revokedAt: new Date(), lastUsedAt: new Date() })
        .where(eq(memberRefreshTokens.id, row.id));

    // ensure member still exists
    const [m] = await db.select().from(members).where(eq(members.id, row.memberId)).limit(1);
    if (!m) throw Object.assign(new Error("Member not found"), { status: 401 });

    // issue new pair
    const access = await signAccessMember({ sub: String(m.id), memberType: m.memberType });
    const refresh = await issueAndStoreRotatingRefreshToken(m.id, req);
    return { access, refresh };
}


export async function requireMember(req: Request, opts?: { types?: MemberType[] }): Promise<MemberIdentity> {
    const token = readCookie(req, "access");
    if (!token) throw httpError(401, "Missing access");
    const p = await verifyAccessMember(token).catch(() => { throw httpError(401, "Invalid/expired"); });
    const id = Number(p.sub);
    if (!Number.isFinite(id)) throw httpError(401, "Bad subject");
    if (opts?.types && !opts.types.includes(p.memberType)) throw httpError(403, "Forbidden");
    return {id, type: p.memberType};
}




/**
 * Verifies the member access token (JWT) and returns the payload.
 * Throws an error with { status: 401 } on failure.
 */
export async function verifyAccessMember(token: string): Promise<AccessPayload> {
    const { payload } = await jwtVerify(token, MEMBER_JWT_SECRET, { issuer: process.env.ISSUER, audience: process.env.AUDIENCE });
    if (payload.realm !== "user") throw httpError(401, "Wrong realm");
    const mt = payload.memberType as MemberType;
    if (mt !== "SUPER_ADMIN" && mt !== "GROUP_ADMIN" && mt !== "MEMBER") {
        throw httpError(401, "Bad member type");
    }
    if (typeof payload.sub !== "string" || !payload.sub) throw httpError(401, "Bad subject");
    return payload as AccessPayload;
}




/* helpers */
function clientMeta(req: Request) {
    const ua = req.headers.get("user-agent") || "";
    const ip = (req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "0.0.0.0").split(",")[0].trim();
    // return { ua, ipHash: sha256(ip) };
    return { ua, ipHash: crypto.createHash("sha256").update(ip).digest("hex") };
}

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

function readCookie(req: Request, name: string) {
    const parts = (req.headers.get("cookie") || "").split(";").map(s => s.trim());
    for (const p of parts) if (p.startsWith(name + "=")) return decodeURIComponent(p.slice(name.length + 1));
    return null;
}

function httpError(status: number, message: string) {
    const err = new Error(message) as Error & { status: number };
    (err as any).status = status;
    return err;
}

