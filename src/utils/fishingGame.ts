import { db } from "@/database/db";
import { fishingGame, fishingGamePlayers } from "@/database/schema";
import BotClient from "@/structures/BotClient";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    Channel,
    EmbedBuilder,
    Interaction
} from "discord.js";
import { and, eq, sql } from "drizzle-orm";
import { emojis } from "./emojis";
import { clamp } from "./mathUtils";
import { getUser } from "./user";

const MAX_FISH = 30;

export const createFishingGame = async (client: BotClient, channel: Channel) => {
    if (!channel.isTextBased()) return;

    const embed = new EmbedBuilder()
        .setTitle("🎣 Fishing Hole 🎣")
        .setDescription(
            `Catch fish to trade for chips.\nThe hole starts with 20 fish with a maximum of ${MAX_FISH} fish.\nOverfishing will kill the fishing hole and no more fish will appear.\n\n🐟 5 fish for ${emojis.chip} 1 chip.`
        )
        .setColor("#52aeeb");

    const button = new ButtonBuilder()
        .setCustomId("catch_fish")
        .setLabel("Try catch a fish")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("🎣");

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

    const message = await channel.send({
        embeds: [embed],
        components: [row]
    });

    // Update db with new game message
    await db.insert(fishingGame).values({
        messageId: message.id,
        channelId: channel.id,
        fish: 20
    });
};

export const handleFishingButtons = async (interaction: Interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === "catch_fish") catchFish(interaction, interaction.message.id);
};

const catchFish = async (interaction: ButtonInteraction, originalMessageId: string) => {
    try {
        await getUser(interaction.user.id);

        // Fetch game data
        const gameResults = await db
            .select()
            .from(fishingGame)
            .where(eq(fishingGame.messageId, originalMessageId))
            .limit(1);
        if (gameResults.length === 0) return;
        const game = gameResults[0];
        const currentFish = game.fish;

        // Chance of catching a fish is minimum 10% maximum 50%
        const chance = clamp(currentFish / MAX_FISH, 0.1, 0.5);
        const roll = Math.random();

        // Build message
        const embed = new EmbedBuilder().setTitle("🐟 Fishing 🐟").setColor("#52aeeb");
        const button = new ButtonBuilder()
            .setCustomId("catch_another_fish")
            .setLabel("Try catch another fish")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("🎣");
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

        // NO FISH
        if (roll > chance) {
            embed.setDescription("You didn't catch a fish. Try again!");
        }
        // FISH CAUGHT
        else {
            // Remove fish from the game
            await db
                .update(fishingGame)
                .set({ fish: currentFish - 1 })
                .where(eq(fishingGame.messageId, interaction.message.id));

            // Upsert player record - create or increment fish count
            await db
                .insert(fishingGamePlayers)
                .values({
                    userId: interaction.user.id,
                    gameId: game.id,
                    fishCaught: 1
                })
                .onConflictDoUpdate({
                    target: [fishingGamePlayers.gameId, fishingGamePlayers.userId],
                    set: { fishCaught: sql`${fishingGamePlayers.fishCaught} + 1` }
                });

            // Fetch the player
            const player = await db
                .select()
                .from(fishingGamePlayers)
                .where(and(eq(fishingGamePlayers.userId, interaction.user.id), eq(fishingGamePlayers.gameId, game.id)))
                .limit(1);

            embed.setDescription(`You caught a fish! 🐟\nYou now have ${player[0].fishCaught} fish!`);
        }

        const message = await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

        const collector = message.createMessageComponentCollector({
            time: 60000 // Collector expires after 10 minutes
        });

        collector.on("collect", async (i) => {
            if (!i.isButton()) return;
            if (i.customId === "catch_another_fish") catchFish(i, originalMessageId);
        });

        collector.on("end", () => {
            // Disable the button when collector expires
            const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(button.setDisabled(true));
            interaction.editReply({ components: [disabledRow] });
        });
    } catch (error) {
        console.error(error);
    }
};
