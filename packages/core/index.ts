import { db, eq, guilds } from "database";
import { pointOfInterest as poiTable } from "database/schema/points-game";
import { pointsOfInterest } from "game-data";

export const initialiseGuild = async (guildId: string) => {
    // Check if guild exists first
    const existingGuild = await db.select().from(guilds).where(eq(guilds.id, guildId)).limit(1);
    if (existingGuild.length === 0) {
        await db.insert(guilds).values({ id: guildId });

        // Load POI from game-data
        await db.insert(poiTable).values(
            pointsOfInterest.map((poi) => ({
                name: poi.name,
                guildId,
                latitude: poi.position[0].toString(),
                longitude: poi.position[1].toString(),
            }))
        );
    }
};

export const resetGuildPointsOfInterest = async (guildId: string) => {
    await db.delete(poiTable).where(eq(poiTable.guildId, guildId));

    // Load POI from game-data
    await db.insert(poiTable).values(
        pointsOfInterest.map((poi) => ({
            name: poi.name,
            guildId,
            latitude: poi.position[0].toString(),
            longitude: poi.position[1].toString(),
        }))
    );
};
