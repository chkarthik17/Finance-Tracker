import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { Entry } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const person = searchParams.get("person");
    const period = searchParams.get("period"); // today, yesterday, week

    const collection = await getCollection<Entry>("entries");

    const now = new Date();
    let startDate: string;
    let endDate: string;

    if (period === "today") {
      startDate = now.toISOString().slice(0, 10);
      endDate = startDate;
    } else if (period === "yesterday") {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      startDate = yesterday.toISOString().slice(0, 10);
      endDate = startDate;
    } else if (period === "week") {
      // Get start of week (Monday)
      const startOfWeek = new Date(now);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      startDate = startOfWeek.toISOString().slice(0, 10);
      endDate = now.toISOString().slice(0, 10);
    } else {
      return NextResponse.json({ error: "Invalid period" }, { status: 400 });
    }

    const query: any = {
      date: { $gte: startDate, $lte: endDate },
    };
    if (person) {
      query.person = person;
    }

    const entries = await collection.find(query).toArray();

    const income = entries
      .filter(e => e.type === "income")
      .reduce((sum, e) => sum + e.amount, 0);

    const expense = entries
      .filter(e => e.type === "expense")
      .reduce((sum, e) => sum + e.amount, 0);

    return NextResponse.json({
      period,
      startDate,
      endDate,
      income,
      expense,
      balance: income - expense,
      count: entries.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
