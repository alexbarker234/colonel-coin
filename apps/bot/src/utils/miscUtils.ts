import { GuildSettings } from "@/types";
import { db, eq, guildSettings } from "database";
import { Guild } from "discord.js";

/**
 * Gets the games channel for a guild & confirms that the channel exists
 */
export async function getGamesChannel(guild: Guild, settings?: GuildSettings) {
    if (!settings) {
        settings = await db
            .select()
            .from(guildSettings)
            .where(eq(guildSettings.id, guild.id))
            .limit(1)
            .then((rows) => rows[0]);
        if (!settings) {
            console.log(`No settings found for ${guild.name}`);
            return;
        }
    }

    const gamesChannelId = settings.gamesChannelId;
    if (!gamesChannelId) {
        console.log(`No games channel set in ${guild.name} `);
        return;
    }

    const gamesChannel = guild.channels.cache.get(gamesChannelId);
    if (!gamesChannel) {
        console.log(`No games channel found in ${guild.name} with id ${gamesChannelId}`);
        return;
    }

    return gamesChannel;
}
