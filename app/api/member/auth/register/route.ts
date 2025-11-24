import { NextResponse } from "next/server";
import {drizzle} from "drizzle-orm/node-postgres";
import { sql } from 'drizzle-orm'; // Import sql
import {members} from "@/db/schema";
import {z} from "zod";
import bcrypt from "bcrypt";


const db = drizzle(process.env.DATABASE_URL!);

const Body = z.object({
    firstName: z.string(),
    lastName: z.string(),
    role: z.enum(['model','photographer','other', 'both']),
    workingName: z.string().optional(),
    emailAddress: z.string(),
    instagram: z.string().optional(),
    tiktok: z.string().optional(),
    facebook: z.string().optional(),
    twitter: z.string().optional(),
    password: z.string(),
    passwordConfirm: z.string(),
});


export async function POST(req: Request) {
    try {
        const json = await req.json();
        const data = Body.parse(json);
        //const hashedPass = crypto.createHash("sha256").update(data.password).digest("hex");

        if (data.password !== data.passwordConfirm) throw({name: 'passwordError', message:'password invalid'});

        let socials = {};
        if (data.instagram) socials = {...socials, ...{instagram: data.instagram}};
        if (data.tiktok) socials = {...socials, ...{tiktok: data.tiktok}};
        if (data.facebook) socials = {...socials, ...{facebook: data.facebook}};
        if (data.twitter) socials = {...socials, ...{twitter: data.twitter}};

        const hashedPass = bcrypt.hashSync(data.password, parseInt(process.env.SALTROUNDS!))

        const inserted = await db
            .insert(members)
            .values({ firstName: data.firstName, lastName: data.lastName,
                role: data.role, memberType: 'MEMBER', workingName: data.workingName, email: data.emailAddress,
                socials: sql`${JSON.stringify(socials)}::jsonb`,
                passwordHash: hashedPass});

        if (inserted) {
            return NextResponse.json("Success!", { status: 201 });
        }

    } catch (err: any) {
        // Validation error
        if (err?.name === "ZodError") {
            return NextResponse.json(
                { error: "Validation failed", details: err.flatten() },
                { status: 422 }
            );
        }
        // Postgres unique violation
        if (err?.code === "23505") {
            return NextResponse.json({ error: "Event already exists" }, { status: 409 });
        }
        console.error("POST /api/admin/events error:", err);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}