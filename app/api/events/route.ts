import {events, groups} from "@/db/schema";
import {asc} from "drizzle-orm";
import {NextResponse} from "next/server";
import {drizzle} from "drizzle-orm/node-postgres"
import {eq, gt, sql, count} from "drizzle-orm";
import { type NextRequest } from 'next/server';

const db = drizzle(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const pageParam: string | null = searchParams.get('page');
    const pageSizeParam: string | null = searchParams.get('pageSize');
    let offset = 0;
    let pageSize = 20;

    if (pageSizeParam)  pageSize = parseInt(pageSizeParam);
    if (pageParam)  offset = pageSize * parseInt(pageParam);

    //const count = await db.$count(events).where(gt(events.startsAt, sql`now()`));
    const rowCount: {count: number}[] = await db.select({ count: count() }).from(events).where(gt(events.startsAt, sql`now()`));
    const rows = await db.select({title: events.title, address:events.address, startsAt:events.startsAt,
        endsAt: events.endsAt, groupId: groups.name}).from(events).where(gt(events.startsAt, sql`now()`)).leftJoin(groups, eq(events.groupId, groups.id))
        .orderBy(asc(events.startsAt)).limit(pageSize).offset(offset);

    const pageCount = Math.ceil(rowCount[0].count / pageSize);
    const returnObj = {
        rows: rows,
        pageCount: pageCount,
        pageSize: pageSize
    }
    return NextResponse.json(returnObj, { status: 200 });
}