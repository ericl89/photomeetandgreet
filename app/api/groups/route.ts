import { NextResponse } from "next/server";
import { groups } from "@/db/schema";
import {asc} from "drizzle-orm";
import {drizzle} from "drizzle-orm/node-postgres";


const db = drizzle(process.env.DATABASE_URL!);



// GET /api/groups  -> list groups
export async function GET() {
    const rows = await db.select().from(groups).orderBy(asc(groups.name));
    return NextResponse.json(rows, { status: 200 });
}

