import { isUserInGuild } from "@/utils/userUtils";
import { and, db, eq, pointsOfInterest } from "database";
import { NextResponse } from "next/server";

export async function DELETE(request: Request, { params }: { params: Promise<{ guildId: string; pointId: string }> }) {
  const { guildId, pointId } = await params;

  if (!(await isUserInGuild(guildId))) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  try {
    // Delete the point of interest
    await db
      .delete(pointsOfInterest)
      .where(and(eq(pointsOfInterest.id, pointId), eq(pointsOfInterest.guildId, guildId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting point of interest:", error);
    return NextResponse.json({ error: "Failed to delete point of interest" }, { status: 500 });
  }
}
