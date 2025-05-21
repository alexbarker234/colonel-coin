import { auth } from "@/auth";
import { calculateDistance } from "@/utils/mapUtils";
import { and, db, eq, gt, pointGame, pointGamePoints, users } from "database";
import { pointsOfInterest } from "game-data";
import { NextResponse } from "next/server";

// TODO put this in a constants file or something
const distanceThreshold = 0.25;

export async function POST(request: Request, { params }: { params: Promise<{ gameId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { gameId } = await params;

  // Check game exists
  const game = await db
    .select()
    .from(pointGame)
    .where(eq(pointGame.id, gameId))
    .limit(1)
    .then((rows) => rows[0]);
  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  // Check user
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)
    .then((rows) => rows[0]);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { longitude, latitude, pointId } = await request.json();

  if (!pointId) return NextResponse.json({ error: "Missing pointId" }, { status: 400 });
  if (!longitude || !latitude) return NextResponse.json({ error: "Missing longitude/latitude" }, { status: 400 });

  // Check if point was claimed in last 2 days
  const twoDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 2);
  const recentlyClaimed = await db
    .select()
    .from(pointGamePoints)
    .where(
      and(
        gt(pointGamePoints.claimedAt, twoDaysAgo),
        eq(pointGamePoints.pointId, pointId),
        eq(pointGamePoints.gameId, gameId)
      )
    )
    .limit(1)
    .then((rows) => rows[0]);

  if (recentlyClaimed) {
    return NextResponse.json({ error: "The point was already claimed in the last 2 days" }, { status: 400 });
  }

  // Get point data from game-data
  const point = pointsOfInterest.find((p) => p.id === pointId);
  if (!point) {
    return NextResponse.json({ error: "Point not found" }, { status: 404 });
  }

  // Check if the point is within the distance threshold
  const distance = calculateDistance(point.position[0], point.position[1], longitude, latitude);
  if (distance > distanceThreshold) {
    return NextResponse.json({ error: "Point is not within the distance threshold" }, { status: 400 });
  }

  // Update or create point claim
  await db
    .insert(pointGamePoints)
    .values({
      pointId,
      gameId,
      claimedByUserId: user.id,
      claimedAt: new Date()
    })
    .onConflictDoUpdate({
      target: pointGamePoints.id,
      set: {
        claimedByUserId: user.id,
        claimedAt: new Date()
      }
    });

  return NextResponse.json({ success: true });
}
