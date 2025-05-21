import { and, db, desc, eq, isNotNull, pointGame, pointGamePlayers, pointGamePoints, sql, users } from "database";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Channel, Client, EmbedBuilder } from "discord.js";
import { pointsOfInterest } from "game-data";

export async function createPointGame(client: Client, channel: Channel) {
    if (!channel.isTextBased() || channel.isDMBased()) return;

    const members = (await channel.guild.members.fetch()).filter((member) => !member.user.bot);
    // why'd i add this? this is a bot for like 2 friends
    if (members.size > 20) {
        await channel.send({
            content: "This server is too big to start a map rush game!"
        });
        return;
    }

    // Check if theres already a game in the server
    const existingGame = await db
        .select()
        .from(pointGame)
        .where(eq(pointGame.channelId, channel.id))
        .limit(1)
        .then((rows) => rows[0]);
    if (existingGame) {
        await channel.send({ content: "There's already a game in this server, deleting old game!" });
        try {
            await db.delete(pointGamePoints).where(eq(pointGamePoints.gameId, existingGame.id));
            await db.delete(pointGamePlayers).where(eq(pointGamePlayers.gameId, existingGame.id));
            await db.delete(pointGame).where(eq(pointGame.id, existingGame.id));
        } catch (error) {
            console.error("Error deleting existing game:", error);
            await channel.send({ content: "There was an error deleting the old game. Please try again later." });
            return;
        }
    }

    const embed = new EmbedBuilder()
        .setTitle("🗺️ Map Rush 🗺️")
        .setDescription("Visit locations on the map to claim points and earn rewards!")
        .setColor("#5865F2")
        .addFields([
            {
                name: "🎯 Points Available",
                value: "0",
                inline: true
            },
            {
                name: "👥 Players",
                value: "-",
                inline: true
            }
        ]);

    const button = new ButtonBuilder()
        .setURL(`${process.env.WEB_URL}/map`)
        .setLabel("Open Map")
        .setStyle(ButtonStyle.Link);

    const infoButton = new ButtonBuilder()
        .setCustomId("point_game_info")
        .setLabel("Info")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("\u2139");

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button, infoButton);

    const message = await channel.send({
        embeds: [embed],
        components: [row]
    });

    // Update db with new game message
    const game = await db
        .insert(pointGame)
        .values({
            messageId: message.id,
            channelId: channel.id,
            gameStartedAt: new Date()
        })
        .returning();

    // For each user in the server, add them to the game
    for (const [userId, user] of members) {
        // Ensure user exists in database
        await db
            .insert(users)
            .values({
                id: userId,
                balance: 0
            })
            .onConflictDoNothing();

        // Add them to the game
        await db.insert(pointGamePlayers).values({
            userId: userId,
            gameId: game[0].id,
            score: 0
        });
    }
}

export const updatePointGames = async (client: Client) => {
    try {
        const games = await db.select().from(pointGame);
        for (const game of games) {
            // Find message
            const channel = await client.channels.cache.get(game.channelId);
            if (!channel || !channel.isTextBased()) continue;

            const message = await channel.messages.fetch(game.messageId);
            if (!message) continue;

            // Get all points owned by users in this game
            const points = await db.select().from(pointGamePoints).where(eq(pointGamePoints.gameId, game.id));

            // Group points by owner
            const pointsByOwner = points.reduce(
                (acc, point) => {
                    if (point.claimedByUserId) {
                        acc[point.claimedByUserId] = (acc[point.claimedByUserId] || 0) + 1;
                    }
                    return acc;
                },
                {} as Record<string, number>
            );

            // Update scores for each player - increment their score by the number of points they own
            for (const [ownerId, pointCount] of Object.entries(pointsByOwner)) {
                console.log(`Updating score for ${ownerId} by ${pointCount}`);
                await db
                    .update(pointGamePlayers)
                    .set({ score: sql`score + ${pointCount}` })
                    .where(and(eq(pointGamePlayers.gameId, game.id), eq(pointGamePlayers.userId, ownerId)));
            }

            // Get all players and their scores
            const players = await db
                .select()
                .from(pointGamePlayers)
                .where(eq(pointGamePlayers.gameId, game.id))
                .orderBy(desc(pointGamePlayers.score));

            // Get the number of claimable points
            const claimablePointsCount = await getClaimablePointsCount(client, game.id);

            // Update the embed
            const embed = message.embeds[0];
            embed.fields[0].value = claimablePointsCount.toString();
            embed.fields[1].value = players
                .map((player, i) => `${i + 1}. <@${player.userId}> - ${player.score}`)
                .join("\n");
            await message.edit({ embeds: [embed] });
        }
    } catch (error) {
        console.error(error);
    }
};

const getClaimablePointsCount = async (client: Client, gameId: string) => {
    // Find all unavailable points from database - claimed less than 2 days ago
    const unavailablePoints = await db
        .select()
        .from(pointGamePoints)
        .where(
            and(
                eq(pointGamePoints.gameId, gameId),
                and(
                    isNotNull(pointGamePoints.claimedByUserId),
                    sql`${pointGamePoints.claimedAt} > NOW() - INTERVAL '2 days'`
                )
            )
        );

    // Filter out points that are unclaimable
    const newPoints = pointsOfInterest.filter(
        (point) => !unavailablePoints.some((dbPoint) => dbPoint.pointId === point.id)
    );

    return newPoints.length;
};
