import { auth } from "@/auth";
import { db, eq, userGuilds } from "database";
import { redirect } from "next/navigation";
import { FaChevronRight, FaUsers } from "react-icons/fa";
export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  // Fetch all guilds the user is in
  const userGuildsData = await db.select().from(userGuilds).where(eq(userGuilds.userId, session.user.id));

  return (
    <div className="pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="mt-2 text-gray-300">Your servers and balances</p>
        </div>

        {userGuildsData.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <FaUsers className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-semibold text-white">No servers found</h3>
            <p className="mt-1 text-sm text-gray-400">You haven&apos;t joined any servers yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {userGuildsData.map((guild) => (
              <div
                key={guild.guildId}
                className="bg-zinc-900 overflow-hidden shadow rounded-lg border border-zinc-700 hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center">
                        <FaUsers className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-medium text-white truncate">Guild {guild.guildId}</h3>
                      <p className="text-sm text-gray-300">Balance: {guild.balance.toLocaleString()} coins</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <a
                      href={`/dashboard/${guild.guildId}`}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-300 bg-indigo-900/50 hover:bg-indigo-800/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                      View Details
                      <FaChevronRight className="ml-2 -mr-0.5 h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
