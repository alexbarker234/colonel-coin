import BotClient from "@/structures/BotClient";
import { db, eq, pointGame, pointGamePlayers, users } from "database";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Channel, EmbedBuilder } from "discord.js";

export async function createPointGame(client: BotClient, channel: Channel) {
    if (!channel.isTextBased() || channel.isDMBased()) return;

    const members = await channel.guild.members.fetch();
    const humanCount = members.filter((member) => !member.user.bot).size;
    // why'd i add this? this is a bot for like 2 friends
    if (humanCount > 20) {
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

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

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
