import { auth } from "@/auth";
import { and, db, eq, userGuilds } from "database";

/**
 * Checks if the currently authenticated user is a member of the given guild.
 * @param guildId The guild ID to check membership for.
 * @returns Promise<boolean> - true if the user is in the guild, false otherwise.
 */
export async function isUserInGuild(guildId: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;

  const userGuild = await db
    .select()
    .from(userGuilds)
    .where(and(eq(userGuilds.guildId, guildId), eq(userGuilds.userId, session.user.id)))
    .limit(1);

  return userGuild.length > 0;
}
