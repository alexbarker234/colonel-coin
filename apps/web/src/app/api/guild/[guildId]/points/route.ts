import { isUserInGuild } from "@/utils/userUtils";
import { db, eq, pointOfInterest } from "database";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;

  if (!(await isUserInGuild(guildId))) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }
  // Get all points of interest for this guild
  const points = await db.select().from(pointOfInterest).where(eq(pointOfInterest.guildId, guildId));

  return NextResponse.json(points);
}

export async function POST(request: Request, { params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;

  if (!(await isUserInGuild(guildId))) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { name, latitude, longitude } = body;

    if (!name || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: "Missing required fields: name, latitude, longitude" }, { status: 400 });
    }

    // Validate coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
    }

    // Insert new point of interest
    const [newPoint] = await db
      .insert(pointOfInterest)
      .values({
        name,
        guildId,
        latitude: latitude.toString(),
        longitude: longitude.toString()
      })
      .returning();

    return NextResponse.json(newPoint, { status: 201 });
  } catch (error) {
    console.error("Error creating point of interest:", error);
    return NextResponse.json({ error: "Failed to create point of interest" }, { status: 500 });
  }
}
