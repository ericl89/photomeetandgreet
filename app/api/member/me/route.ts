import {jwtVerify} from "jose";
import {NextResponse} from "next/server";
import {requireMember} from "@/lib/auth/member";
import {drizzle} from "drizzle-orm/node-postgres"
import {eq, gt, sql, count} from "drizzle-orm";
import {members} from "@/db/schema";

const db = drizzle(process.env.DATABASE_URL!);
// GET /api/member/me
export async function GET(req: Request) {
    const me = await requireMember(req);
    const [row] = await db.select({firstName: members.firstName, lastName: members.lastName, email: members.email,
        memberType: members.memberType, role: members.role, socials: members.socials,
        workingName: members.workingName}).from(members).where(eq(members.id, me.id)).limit(1);
    return NextResponse.json([row]);
}

// // PUT /api/member/me
// export async function PUT(req: Request) {
//     const me = await requireMember(req);
//     const body = MemberUpdate.parse(await req.json());
//     await db.update(members).set({ ...body, updatedAt: new Date() }).where(eq(members.id, me.id));
//     return NextResponse.json({ ok: true });
// }