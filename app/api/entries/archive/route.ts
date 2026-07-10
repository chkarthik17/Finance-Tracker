import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { Entry } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cutoffDate, person } = body;

    if (!cutoffDate) {
      return NextResponse.json({ error: "cutoffDate is required" }, { status: 400 });
    }

    const collection = await getCollection<Entry>("entries");

    // Delete entries older than cutoff date
    const query: any = { date: { $lt: cutoffDate } };
    if (person) {
      query.person = person;
    }

    const result = await collection.deleteMany(query);

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      message: `Deleted ${result.deletedCount} entries older than ${cutoffDate}`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
