import BotClient from "@/structures/BotClient";
import { and, db, desc, eq } from "database";
import { buttonGame, buttonGamePlayers } from "database/schema";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Channel, EmbedBuilder, Interaction } from "discord.js";
import { getUser } from "./user";

export const createButtonGame = async (client: BotClient, channel: Channel) => {
    if (!channel.isTextBased()) return;

    const embed = new EmbedBuilder()
        .setTitle("🎮 The Button Game 🎮")
        .setDescription("Press the button to set your score to the current value and reset the button.")
        .setColor("#29d958")
        .addFields([
            {
                name: "💰 Value",
                value: "0",
                inline: true
            },
            {
                name: "👥 Players",
                value: "-",
                inline: true
            },
            {
                name: "❗ Last Press",
                value: "-",
                inline: false
            }
        ]);

    const button = new ButtonBuilder()
        .setCustomId("button_game")
        .setLabel("Press the button")
        .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

    const message = await channel.send({
        embeds: [embed],
        components: [row]
    });

    // Update db with new game message
    await db.insert(buttonGame).values({
        messageId: message.id,
        channelId: channel.id,
        value: 0
    });
};

export const handleButtonPress = async (interaction: Interaction) => {
    try {
        await getUser(interaction.user.id);

        if (!interaction.isButton() || interaction.customId !== "button_game") return;

        // Get the game data from the database
        const games = await db
            .select()
            .from(buttonGame)
            .where(eq(buttonGame.messageId, interaction.message.id))
            .limit(1);
        if (games.length === 0) return;
        const game = games[0];

        const currentScore = game.value;

        // Reset the value to 0
        await db.update(buttonGame).set({ value: 0 }).where(eq(buttonGame.messageId, interaction.message.id));

        // Fetch the player
        const player = await db
            .select()
            .from(buttonGamePlayers)
            .where(and(eq(buttonGamePlayers.userId, interaction.user.id), eq(buttonGamePlayers.gameId, game.id)))
            .limit(1);

        // If the player doesn't exist, create them
        if (player.length === 0) {
            await db.insert(buttonGamePlayers).values({
                userId: interaction.user.id,
                gameId: game.id,
                score: currentScore
            });
        }
        // Update the players score if it's higher than their current score
        else if (currentScore > player[0].score) {
            await db
                .update(buttonGamePlayers)
                .set({ score: currentScore })
                .where(and(eq(buttonGamePlayers.userId, interaction.user.id), eq(buttonGamePlayers.gameId, game.id)));
        }

        // Update embeds value to 0
        const embed = interaction.message.embeds[0];
        embed.fields[0].value = "0";

        // Update the embed's scorecard with all the players and their scores
        const players = await db
            .select()
            .from(buttonGamePlayers)
            .where(eq(buttonGamePlayers.gameId, game.id))
            .orderBy(desc(buttonGamePlayers.score));

        const playerList = players.map((player) => `<@${player.userId}> - ${player.score}`).join("\n");
        embed.fields[1].value = playerList;

        // Update the last press with timestamp
        embed.fields[2].value = `<@${interaction.user.id}> <t:${Math.floor(Date.now() / 1000)}:R>`;

        await interaction.update({ embeds: [embed] });
    } catch (error) {
        console.error(error);
    }
};

export const updateButtonGames = async (client: BotClient) => {
    try {
        const games = await db.select().from(buttonGame);
        for (const game of games) {
            // Increment the value by 1
            const newValue = game.value + 1;
            await db.update(buttonGame).set({ value: newValue }).where(eq(buttonGame.id, game.id));

            // Find message
            const channel = await client.channels.cache.get(game.channelId);
            if (!channel || !channel.isTextBased()) continue;

            const message = await channel.messages.fetch(game.messageId);
            if (!message) continue;

            // Update the embed
            const embed = message.embeds[0];
            embed.fields[0].value = newValue.toString();
            await message.edit({ embeds: [embed] });
        }
    } catch (error) {
        console.error(error);
    }
};
