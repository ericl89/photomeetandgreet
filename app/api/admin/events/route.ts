import {type NextRequest, NextResponse} from "next/server";
import { z } from "zod";
import {attendances, events, groups} from "@/db/schema";
import {drizzle} from "drizzle-orm/node-postgres";
import {getDateFromValues} from "@/lib/utils";
import {asc, desc, count, eq, gt, lt, sql} from "drizzle-orm";
//import {PgSelectQueryBuilder, QueryBuilder} from 'drizzle-orm/pg-core';


const db = drizzle(process.env.DATABASE_URL!);

// zod schema for POST body
const Body = z.object({
    groupId: z.string(),
    title: z.string(),
    address: z.string(),
    eventDate: z.string(),
    startsAt: z.string(),
    endsAt: z.string(),
    timezone: z.string().min(1).max(64),
    status: z.literal(["draft", "published", "canceled"]).optional(),
    createdBy: z.number().optional(),
});

// POST /api/admin/events -> create an event
export async function POST(req: Request) {

    try {

        const json = await req.json();
        const data = Body.parse(json);

        // Get group slug for appending onto event slug
        const group = await db.select({ id: groups.id }).from(groups).where(eq(groups.id, parseInt(data.groupId)));

        // Generate a guid - This is used as a private QR Code for signing in on location
        const qrSecret = crypto.randomUUID();
        // More friendly version in case we need to go a more simple route
        const signInSlug = qrSecret.substring(0,4);

        // We only store a start timestamp and an end timestamp in the db so let's use the date + hours from form
        const eventDate = new Date(data.eventDate);
        const start = getDateFromValues(eventDate, data.startsAt);
        const end = getDateFromValues(eventDate, data.endsAt);

        const inserted = await db
            .insert(events)
            .values({ groupId: group[0].id, title: data.title,
                address: data.address, startsAt: start, endsAt: end,
                status: "published", signInSlug: signInSlug, qrSecret: qrSecret, timezone: data.timezone });

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


export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const when: string | null = searchParams.get('when');
    const pageParam: string | null = searchParams.get('page');
    const pageSizeParam: string | null = searchParams.get('pageSize');
    let offset = 0;
    let pageSize = 20;
    let rowCount;
    let rowCountNum: number = 0;
    let rows = [];

    if (pageSizeParam)  pageSize = parseInt(pageSizeParam);
    if (pageParam)  offset = pageSize * parseInt(pageParam);


    // const qb = new QueryBuilder();
    // const countQuery = qb.select({ count: count().as("count") }).from(events).where(lt(events.startsAt, sql`now()`)).$dynamic();
    //
    // function past<T extends PgSelectQueryBuilder>(qb: T) {
    //     //console.log("rowCount", qb.orderBy(asc(events.startsAt)));
    //     return qb.orderBy(asc(events.startsAt));
    // }
    //
    // function future<T extends PgSelectQueryBuilder>(qb: T) {
    //     //console.log("rowCount", qb.orderBy(desc(events.startsAt)));
    //     return qb.orderBy(desc(events.startsAt));
    // }



    if (when === "past") {

        //countQuery = past(countQuery);
        rowCount = await db.select({ count: count() }).from(events).where(lt(events.startsAt, sql`now()`));
        //rowCount = past(countQuery);
        const attendanceCounts = db
            .select({
                eventId: attendances.eventId,
                attendeeCount: count(attendances.id).as("attendeeCount"), // <-- alias here
            })
            .from(attendances)
            .groupBy(attendances.eventId)
            .as("attendance_counts");

        rows = await db
            .select({
                title: events.title,
                address: events.address,
                startsAt: events.startsAt,
                endsAt: events.endsAt,
                groupId: groups.name,
                // alias the outer raw expression too
                attendeeCount: sql<number>`coalesce(${attendanceCounts.attendeeCount}, 0)`.as("attendeeCount"),
            })
            .from(events)
            .leftJoin(groups, eq(events.groupId, groups.id))
            .leftJoin(attendanceCounts, eq(events.id, attendanceCounts.eventId))
            .where(lt(events.startsAt, sql`now()`))
            .orderBy(asc(events.startsAt))
            .limit(pageSize)
            .offset(offset);
    } else {
        rowCount = await db.select({ count: count() }).from(events).where(gt(events.startsAt, sql`now()`));
        //rowCount = future(countQuery);
        rows = await db.select({title: events.title, address:events.address, startsAt:events.startsAt,
            endsAt: events.endsAt, groupId: groups.name}).from(events).where(gt(events.startsAt, sql`now()`))
            .leftJoin(groups, eq(events.groupId, groups.id))
            .orderBy(asc(events.startsAt)).limit(pageSize).offset(offset);
    }

    console.log("rowCount", rowCount[0].count);

    rowCountNum = rowCount[0].count;
    const pageCount = Math.ceil(rowCountNum / pageSize);
    const returnObj = {
        rows: rows,
        rowCount: 0,
        pageCount: pageCount,
        pageSize: pageSize
    }
    return NextResponse.json(returnObj, { status: 200 });
}