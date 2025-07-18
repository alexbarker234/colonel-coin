import { and, db, eq, InferSelectModel, userGuilds, users } from "database";

export async function getUser(id: string, guildId?: string): Promise<InferSelectModel<typeof users>> {
    const user = await db.select().from(users).where(eq(users.id, id)).limit(1);

    if (user.length === 0) {
        await db.insert(users).values({ id });
        if (guildId) {
            await db.insert(userGuilds).values({ userId: id, guildId });
        }
        return await getUser(id, guildId);
    }

    if (guildId) {
        const userGuild = await db
            .select()
            .from(userGuilds)
            .where(and(eq(userGuilds.userId, id), eq(userGuilds.guildId, guildId)))
            .limit(1);

        if (userGuild.length === 0) {
            await db.insert(userGuilds).values({ userId: id, guildId });
        }
    }

    return user[0];
}
