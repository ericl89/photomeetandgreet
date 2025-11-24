import { NextResponse } from "next/server";
import { z } from "zod";
import { groups } from "@/db/schema";
import {eq} from "drizzle-orm";
import {drizzle} from "drizzle-orm/node-postgres";


const db = drizzle(process.env.DATABASE_URL!);

// zod schema for POST body
const Body = z.object({
    id: z.number().optional(),
    name: z.string().min(1).max(60),
    slug: z.string().min(1).max(20),
    timezone: z.string().min(1).max(40),
});

// POST /api/admin/groups -> create/edit a group
export async function POST(req: Request) {

    try {

        const json = await req.json();
        const data = Body.parse(json);

        if (data.id) {
            // We're editing!
            const updated = await db.update(groups).set({name: data.name, slug: data.slug, timezone: data.timezone}).where(eq(groups.id, data.id));
            if (updated) {
                return NextResponse.json("Success!", { status: 201 });
            }

        } else {
            // We're creating!
            const inserted = await db
                .insert(groups)
                .values({ name: data.name, slug: data.slug, timezone: data.timezone });

            if (inserted) {
                return NextResponse.json("Success!", { status: 201 });
            }

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
            return NextResponse.json({ error: "Group already exists" }, { status: 409 });
        }
        console.error("POST /api/groups error:", err);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}