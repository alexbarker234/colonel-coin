import { auth } from "@/auth";
import GuildIcon from "@/components/GuildIcon";
import { getGuildInfo } from "@/services/discord";
import { db, eq, userGuilds } from "database";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { FaChevronLeft } from "react-icons/fa";

interface DashboardGuildPageProps {
  params: Promise<{ guildId: string }>;
}

const getCachedUserGuilds = unstable_cache(
  async (guildId: string) => {
    return await db.select().from(userGuilds).where(eq(userGuilds.guildId, guildId));
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
  const userGuildsData = await getCachedUserGuilds(guildId);
  if (!userGuildsData.some((guild) => guild.guildId === guildId)) {
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
        <div className="flex items-center mb-4">
          <GuildIcon iconURL={guildInfo.iconURL} name={guildInfo.name} className="mr-2" />
          <h1 className="text-3xl font-bold text-white">{guildInfo.name}</h1>
        </div>
        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-700">
          <p className="text-lg text-gray-300">
            <span className="font-semibold text-white">Guild ID:</span> {guildInfo.name}
          </p>
        </div>
      </div>
    </div>
  );
}
