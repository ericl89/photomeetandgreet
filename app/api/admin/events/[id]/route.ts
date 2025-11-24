import {type NextRequest, NextResponse} from "next/server";
import { z } from "zod";
import {events, groups} from "@/db/schema";
import {asc, eq, gt, sql} from "drizzle-orm";
import {drizzle} from "drizzle-orm/node-postgres";
import {getDateFromValues} from "@/lib/utils";


const db = drizzle(process.env.DATABASE_URL!);

// zod schema for POST body
const Body = z.object({
    title: z.string(),
    address: z.string(),
    eventDate: z.string(),
    startsAt: z.string(),
    endsAt: z.string(),
    timezone: z.string().min(1).max(32),
    status: z.literal(["draft", "published", "canceled"]),
});


// POST /api/admin/events/id -> edit an event
export async function PUT(req: Request, { params }: { params: { id: number } }) {
    const { id } = await params;
    try {

        const json = await req.json();
        const data = Body.parse(json);

        const eventDate = new Date(data.eventDate);
        const start = getDateFromValues(eventDate, data.startsAt);
        const end = getDateFromValues(eventDate, data.endsAt);

        // We're editing!
        const updated = await db.update(events).set({title: data.title,
            address: data.address, startsAt: start, endsAt: end,
            timezone: data.timezone, }).where(eq(events.id, id));
        if (updated) {
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

        console.error("POST /api/admin/events/id error:", err);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

export async function GET(req: Request, { params }: { params: { id: number } }) {
    const { id } = await params;
    const result = await db.select({title: events.title, address:events.address, startsAt:events.startsAt,
        endsAt: events.endsAt, groupId: events.groupId, timezone: events.timezone}).from(events).where(eq(events.id, id)).limit(1);

    return NextResponse.json(result, { status: 200 });
}