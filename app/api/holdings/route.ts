import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection, convertId } from "@/lib/mongodb";
import { Holding } from "@/lib/types";

export async function GET() {
  try {
    const collection = await getCollection<Holding>("holdings");
    const holdings = await collection
      .find({})
      .sort({ created_at: 1 })
      .toArray();

    return NextResponse.json(holdings.map(convertId));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const collection = await getCollection<Holding>("holdings");

    const holding = {
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const result = await collection.insertOne(holding as any);
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

    const collection = await getCollection<Holding>("holdings");
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updated_at: new Date().toISOString() } }
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

    const collection = await getCollection<Holding>("holdings");
    await collection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
