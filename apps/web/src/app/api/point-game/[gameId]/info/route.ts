import { auth } from "@/auth";
import { getUserInfo } from "@/services/discord";
import { PointData } from "@/types";
import { db, eq, pointGame, pointGamePoints } from "database";
import { pointsOfInterest } from "game-data";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { gameId: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gameId = params.gameId;
  // Check game exists
  const game = await db
    .select()
    .from(pointGame)
    .where(eq(pointGame.id, params.gameId))
    .limit(1)
    .then((rows) => rows[0]);
  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  // Get all points from database with their claim info
  const pointsData = await db.select().from(pointGamePoints).where(eq(pointGamePoints.gameId, gameId));

  // Get all points from game-data and merge with database info
  const points = pointsOfInterest.map((point) => {
    const claimedPoint = pointsData.find((cp) => cp.pointId === point.id);
    return {
      ...point,
      claimedBy: claimedPoint?.claimedByUserId
        ? {
            id: claimedPoint.claimedByUserId,
            claimedAt: claimedPoint.claimedAt!,
            // Will be filled in later
            username: "",
            avatar: ""
          }
        : null
    };
  });

  // Get Discord user info for each claimer
  const pointsWithUserInfo: PointData[] = await Promise.all(
    points.map(async (point) => {
      if (!point.claimedBy) return point;

      try {
        const user = await getUserInfo(point.claimedBy.id);
        return {
          ...point,
          claimedBy: {
            ...point.claimedBy,
            username: user.username,
            avatar: user.avatarURL
          }
        };
      } catch (error) {
        console.error(`Error fetching Discord user ${point.claimedBy.id}:`, error);
        return point;
      }
    })
  );

  return NextResponse.json({ points: pointsWithUserInfo });
}
