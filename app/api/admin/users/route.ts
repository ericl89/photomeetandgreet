import {type NextRequest, NextResponse} from "next/server";
import {events, members} from "@/db/schema";
import {drizzle} from "drizzle-orm/node-postgres";
import {asc, count, gt, sql} from "drizzle-orm";


const db = drizzle(process.env.DATABASE_URL!);


export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const pageParam: string | null = searchParams.get('page');
    const pageSizeParam: string | null = searchParams.get('pageSize');
    let offset = 0;
    let pageSize = 20;
    let rowCountNum: number = 0;
    let rows = [];

    if (pageSizeParam)  pageSize = parseInt(pageSizeParam);
    if (pageParam)  offset = pageSize * parseInt(pageParam);



        const rowCount = await db.select({ count: count() }).from(members);
        rows = await db.select({id: members.id, firstName: members.firstName, lastName: members.lastName,
            email: members.email, role: members.role, workingName: members.workingName, socials: members.socials})
            .from(members)
            .orderBy(asc(members.lastLoginAt)).limit(pageSize).offset(offset);


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