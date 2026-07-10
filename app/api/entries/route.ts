import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection, convertId } from "@/lib/mongodb";
import { Entry } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const person = searchParams.get("person");

    const collection = await getCollection<Entry>("entries");

    // Build query
    const query: any = {};

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    // Person filter
    if (person) {
      query.person = person;
    }

    const entries = await collection
      .find(query)
      .sort({ date: -1 })
      .toArray();

    return NextResponse.json(entries.map(convertId));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const collection = await getCollection<Entry>("entries");

    const entry = {
      ...body,
      created_at: new Date().toISOString(),
    };

    const result = await collection.insertOne(entry as any);
    const inserted = await collection.findOne({ _id: result.insertedId });

    return NextResponse.json(convertId(inserted!));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const collection = await getCollection<Entry>("entries");
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    const updated = await collection.findOne({ _id: new ObjectId(id) });
    return NextResponse.json(convertId(updated!));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const collection = await getCollection<Entry>("entries");
    await collection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
