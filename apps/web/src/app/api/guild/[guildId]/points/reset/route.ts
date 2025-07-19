import { isUserInGuild } from "@/utils/userUtils";
import { resetGuildPointsOfInterest } from "core";
import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;

  if (!(await isUserInGuild(guildId))) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  try {
    await resetGuildPointsOfInterest(guildId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error resetting points of interest:", error);
    return NextResponse.json({ error: "Failed to reset points of interest" }, { status: 500 });
  }
}
