import { auth } from "@/auth";
import { db, eq, userGuilds } from "database";
import { notFound, redirect } from "next/navigation";

interface DashboardGuildPageProps {
  params: Promise<{ guildId: string }>;
}

export default async function DashboardGuildPage({ params }: DashboardGuildPageProps) {
  const { guildId } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect("/");

  // If the user is not in the guild
  const userGuildsData = await db.select().from(userGuilds).where(eq(userGuilds.guildId, guildId));
  if (!userGuildsData.some((guild) => guild.guildId === guildId)) {
    notFound();
  }

  return (
    <div className="pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-4">Guild Details</h1>
        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-700">
          <p className="text-lg text-gray-300">
            <span className="font-semibold text-white">Guild ID:</span> {guildId}
          </p>
        </div>
      </div>
    </div>
  );
}
