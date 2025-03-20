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
import { and, eq, gt, sql } from "drizzle-orm";
import { emojis } from "./emojis";
import { clamp } from "./mathUtils";
import { getUser } from "./user";

const MAX_FISH = 30;

export const createFishingGame = async (client: BotClient, channel: Channel) => {
    if (!channel.isTextBased()) return;

    const embed = new EmbedBuilder()
        .setTitle("🎣 Fishing Hole 🎣")
        .setDescription(
            `Catch fish to trade for chips.\nThe hole starts with 20 fish, fish breed over time with a maximum of ${MAX_FISH} fish.\nOverfishing will kill the fishing hole and no more fish will appear.\n\n🐟 5 fish for ${emojis.chip} 1 chip.`
        )
        .setColor("#52aeeb");

    const button = new ButtonBuilder()
        .setCustomId("start_fishing_game")
        .setLabel("Start fishing")
        .setEmoji("🎣")
        .setStyle(ButtonStyle.Primary);

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

const sendFishingMessage = async (interaction: ButtonInteraction) => {
    const game = await db.select().from(fishingGame).where(eq(fishingGame.messageId, interaction.message.id)).limit(1);
    if (game.length === 0) return;
    const gameId = game[0].id;

    const embed = new EmbedBuilder()
        .setTitle("🐟 You are fishing 🐟")
        .setDescription("Press the button to fish")
        .setColor("#52aeeb");

    const button = new ButtonBuilder()
        .setCustomId("catch_fish")
        .setLabel("Try catch a fish")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("🎣");

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

    const message = await interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true,
        fetchReply: true
    });

    const collector = message.createMessageComponentCollector({
        time: 600000 // Collector expires after 10 minutes
    });

    collector.on("collect", async (i) => {
        if (i.isButton() && i.customId === "catch_fish") catchFish(i, embed, interaction, gameId);
    });

    collector.on("end", () => interaction.deleteReply());

    return { message, embed };
};

export const handleFishingButtons = async (interaction: Interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === "start_fishing_game") startFishingGame(interaction);
};

const catchFish = async (
    interaction: ButtonInteraction,
    embed: EmbedBuilder,
    originalInteraction: ButtonInteraction,
    gameId: string
) => {
    try {
        await getUser(interaction.user.id);

        // Get the game data from the database
        const gameResults = await db.select().from(fishingGame).where(eq(fishingGame.id, gameId)).limit(1);
        if (gameResults.length === 0) return;
        const game = gameResults[0];

        const currentFish = game.fish;

        // Chance of catching a fish is minimum 10% maximum 50%
        const chance = clamp(currentFish / MAX_FISH, 0.1, 0.5);
        const roll = Math.random();

        // Fetch the player
        const playerResults = await db
            .select()
            .from(fishingGamePlayers)
            .where(and(eq(fishingGamePlayers.userId, interaction.user.id), eq(fishingGamePlayers.gameId, game.id)))
            .limit(1);
        const player = playerResults[0];

        // FISH CAUGHT
        if (roll <= chance && currentFish > 0) {
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

            // Edit the message embed
            embed.setDescription(`You caught a fish! 🐟\n\nYou have ${player.fishCaught + 1} fish!`);
        }
        // No fish
        else {
            embed.setDescription(`You didn't catch a fish. Try again!\n\nYou have ${player.fishCaught} fish!`);
        }

        interaction.deferUpdate();
        await originalInteraction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error(error);
    }
};

const startFishingGame = async (interaction: Interaction) => {
    try {
        await getUser(interaction.user.id);

        if (!interaction.isButton() || interaction.customId !== "start_fishing_game") return;

        // send personal fishing minigame
        await sendFishingMessage(interaction);
    } catch (error) {
        console.error(error);
    }
};

/**
 * Handles fish breeding mechanics for a fishing game instance
 *
 * Every pair of fish contributes to breeding progress, which accumulates hourly.
 * Progress is calculated as: (number of fish pairs * 100%) / 24 hours
 * When progress reaches 100%, a new fish spawns and progress resets.
 * Multiple fish can spawn if enough progress accumulates.
 * The total fish count is capped at MAX_FISH.
 *
 * @param gameId - UUID of the fishing game instance
 */
export const updateFishingGameBreeding = async () => {
    const games = await db.select().from(fishingGame).where(gt(fishingGame.fish, 0));

    for (const game of games) {
        // Calculate breeding progress increment based on number of fish pairs
        // 24 increments needed to reach 100%, so divide by 24 for hourly updates
        const fishPairs = Math.floor(game.fish / 2);
        const progressIncrement = (fishPairs * 100) / 24;

        // Add progress and check if we should spawn new fish
        let newProgress = game.breedingProgress + progressIncrement;
        let newFish = 0;

        // While we have 100% or more progress, spawn a fish and subtract 100%
        while (newProgress >= 100) {
            newProgress -= 100;
            newFish++;
        }
        newProgress = Math.floor(newProgress);

        // console.log(`For game ${game.id} we have ${newFish} new fish and ${newProgress}% progress`);

        // Update the game with new fish count and remaining progress
        const totalFish = Math.min(game.fish + newFish, MAX_FISH);

        await db
            .update(fishingGame)
            .set({
                fish: totalFish,
                breedingProgress: newProgress
            })
            .where(eq(fishingGame.id, game.id));
    }
};
