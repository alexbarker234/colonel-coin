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
    Interaction,
    Message
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
        .setCustomId("start_fishing_game")
        .setLabel("Start fishing")
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
        time: 60000 // Collector expires after 10 minutes
    });

    collector.on("collect", async (i) => {
        if (!i.isButton()) return;
        console.log(i.customId);
        if (i.customId === "catch_fish") catchFish(i, embed, message, gameId);
        console.log("collected");
    });

    collector.on("end", () => {
        // Disable the button when collector expires
        const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(button.setDisabled(true));
        message.edit({ components: [disabledRow] });
    });

    return { message, embed };
};

export const handleFishingButtons = async (interaction: Interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === "start_fishing_game") startFishingGame(interaction);
};

const catchFish = async (interaction: ButtonInteraction, embed: EmbedBuilder, message: Message, gameId: string) => {
    try {
        await getUser(interaction.user.id);

        // Get the game data from the database
        const games = await db.select().from(fishingGame).where(eq(fishingGame.id, gameId)).limit(1);

        if (games.length === 0) return;
        const game = games[0];

        const currentFish = game.fish;

        // Chance of catching a fish is minimum 10% maximum 50%
        const chance = clamp(currentFish / MAX_FISH, 0.1, 0.5);
        const roll = Math.random();

        console.log(chance, roll);

        // NO FISH
        if (roll > chance) {
            // Edit the message embed
            embed.setDescription("You didn't catch a fish. Try again!");
            await message.edit({ embeds: [embed] });
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
                    set: { fishCaught: sql`fish_caught + 1` }
                });

            // Fetch the player
            const player = await db
                .select()
                .from(fishingGamePlayers)
                .where(and(eq(fishingGamePlayers.userId, interaction.user.id), eq(fishingGamePlayers.gameId, game.id)))
                .limit(1);

            // TODO i just realised you cant edit ephermal messages
            // Edit the message embed
            embed.setDescription(`You caught a fish! 🐟\nYou now have ${player[0].fishCaught} fish!`);
            await message.edit({ embeds: [embed] });
        }
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
