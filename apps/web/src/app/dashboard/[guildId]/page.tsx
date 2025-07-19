import { auth } from "@/auth";
import GuildIcon from "@/components/GuildIcon";
import PointsEditor from "@/components/PointsEditor/PointsEditor";
import { getGuildInfo } from "@/services/discord";
import { and, db, eq, userGuilds } from "database";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { FaChevronLeft } from "react-icons/fa";

interface DashboardGuildPageProps {
  params: Promise<{ guildId: string }>;
}

const getThisUserGuild = unstable_cache(
  async (guildId: string, userId: string) => {
    return (
      (
        await db
          .select()
          .from(userGuilds)
          .where(and(eq(userGuilds.guildId, guildId), eq(userGuilds.userId, userId)))
      )[0] || null
    );
  },
  ["user-guilds"],
  {
    revalidate: 60,
    tags: ["user-guilds"]
  }
);

export default async function DashboardGuildPage({ params }: DashboardGuildPageProps) {
  const { guildId } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect("/");

  // If the user is not in the guild
  const userGuildData = await getThisUserGuild(guildId, session.user.id);
  if (!userGuildData) {
    notFound();
  }

  const guildInfo = await getGuildInfo(guildId);

  return (
    <div className="pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/dashboard"
          className="text-sm text-gray-400 hover:text-gray-300 mb-4 flex items-center transition-colors"
        >
          <FaChevronLeft className="mr-2" />
          Back to dashboard
        </Link>
        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-700">
          <div className="flex items-center mb-4">
            <GuildIcon iconURL={guildInfo.iconURL} name={guildInfo.name} className="mr-2" />
            <h1 className="text-3xl font-bold text-white">{guildInfo.name}</h1>
          </div>
          <p className="text-sm text-gray-300">Your balance: {userGuildData.balance.toLocaleString()} coins</p>
        </div>
        <div className="mt-6">
          <PointsEditor guildId={guildId} />
        </div>
      </div>
    </div>
  );
}
