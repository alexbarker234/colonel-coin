import { auth } from "@/auth";
import { db, desc, eq, pointGame, pointGamePlayers } from "database";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FaHome } from "react-icons/fa";
import MapPageClient from "./page-client";

export default async function MapPage() {
  const session = await auth();

  if (!session?.user?.id) return redirect("/");

  // Find the first active game for the current user
  // TODO handle multiple games if this is ever needed
  const firstGame = await db
    .select()
    .from(pointGame)
    .innerJoin(pointGamePlayers, eq(pointGame.id, pointGamePlayers.gameId))
    .where(eq(pointGamePlayers.userId, session.user.id))
    .orderBy(desc(pointGame.gameStartedAt))
    .limit(1)
    .then((rows) => rows[0]?.point_game);

  if (!firstGame)
    return (
      <div className="flex flex-col font-bold text-center items-center justify-center h-full">
        <h1 className="text-2xl mb-4">No active game found</h1>
        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-3 bg-[#5865F2] text-white rounded-lg hover:bg-[#4752C4] transition-colors cursor-pointer w-fit"
        >
          <FaHome size={24} />
          Return Home
        </Link>
      </div>
    );

  return <MapPageClient />;
}
