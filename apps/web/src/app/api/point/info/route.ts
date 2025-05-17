import { auth } from "@/auth";
import { getUserInfo } from "@/services/discord";
import { PointData } from "@/types";
import { db, pointGamePoints } from "database";
import { pointsOfInterest } from "game-data";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Get all points from database with their claim info
  const pointsData = await db.select().from(pointGamePoints);

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
