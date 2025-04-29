import { db } from "@/database/db";
import { bounties, guildSettings } from "@/database/schema";
import BotClient from "@/structures/BotClient";
import { EmbedBuilder, Guild } from "discord.js";
import { isNotNull } from "drizzle-orm";
import { createButtonGame } from "./buttonGame";

interface Bounty {
    id: number;
    description: string;
    wildcard?: boolean;
    negative?: boolean;
    reward?: string;
    penalty?: string;
}

export const sendBounty = async (client: BotClient) => {
    const guilds = client.guilds.cache;

    // Choose bounty
    const bounty = await chooseBounty();
    if (!bounty) return;

    // Fetch guild settings from DB
    const guildSettingList = await db.select().from(guildSettings).where(isNotNull(guildSettings.bountiesChannelId));

    console.log(`Found ${guildSettingList.length} guilds with bounties enabled`);

    // Map containing guild id, Guild, settings
    const guildMap = new Map<string, { guild: Guild; settings: typeof guildSettings.$inferSelect }>();
    for (const guildSetting of guildSettingList) {
        const guild = guilds.get(guildSetting.id);
        if (!guild) continue;

        guildMap.set(guildSetting.id, { guild, settings: guildSetting });
    }

    console.log(`Sending bounty to ${guildMap.size} guilds`);

    const embed = createBountyEmbed(bounty);

    // For each guild, send the bounty message
    for (const [guildId, { guild, settings }] of guildMap) {
        const channelId = settings.bountiesChannelId;
        if (!channelId) continue;

        console.log(`Sending bounty to ${guild.name} with id ${channelId}`);
        const channel = guild.channels.cache.get(channelId);
        if (!channel) {
            console.log(`No channel found in ${guild.name} with id ${channelId}`);
            continue;
        }
        if (!channel.isTextBased()) continue;

        channel.send({ embeds: [embed] });

        // SPECIAL CASE FOR BUTTON BOUNTY
        if (bounty.id === 28) {
            const gamesChannelId = settings.gamesChannelId;
            if (!gamesChannelId) {
                console.log(`No games channel set in ${guild.name} `);
                continue;
            }

            const gamesChannel = guild.channels.cache.get(gamesChannelId);
            if (!gamesChannel) {
                console.log(`No games channel found in ${guild.name} with id ${gamesChannelId}`);
                continue;
            }

            await createButtonGame(client, gamesChannel);
        }
    }

    // Update the DB with the chosen bounty
    await db.insert(bounties).values({
        id: bounty.id
    });
};

export const createBountyEmbed = (bounty: Bounty) => {
    const embed = new EmbedBuilder()
        .setTitle("🎯 New Bounty!")
        .setDescription(bounty.description)
        .setColor("#3498db")
        .setTimestamp();

    if (bounty.wildcard) {
        embed.setTitle("🎲 New Wildcard Bounty!");
        embed.setColor("#9b59b6");
    }
    if (bounty.negative) {
        embed.setTitle("🚫 New Penalty Bounty!");
        embed.setColor("#e74c3c");
    }

    if (bounty.reward) {
        embed.addFields({
            name: "Reward",
            value: bounty.reward,
            inline: true
        });
    }
    if (bounty.penalty) {
        embed.addFields({
            name: "Penalty",
            value: bounty.penalty,
            inline: true
        });
    }

    // RANDOM CHIP BOUNTY, choose the chip and add it as a field
    if (bounty.id === 29) {
        const chipColours = ["🟢 Green 🟢", "🔴 Red 🔴", "🔵 Blue 🔵", "⚫ Black ⚫", "⬜ White ⬜"];

        const randomChipColour = chipColours[Math.floor(Math.random() * chipColours.length)];
        embed.addFields({
            name: "Negative Chip",
            value: randomChipColour
        });
    }

    return embed;
};

export const chooseBounty = async (id?: number): Promise<Bounty | null> => {
    const bountiesJSON = require("../bounties.json");
    // If id is specified, just load the id
    if (id) {
        const bounty = bountiesJSON.find((b: any) => b.id === id);
        if (!bounty) {
            throw new Error(`Bounty with ID ${id} not found`);
        }
        return bounty;
    }

    // Get all previously used bounty IDs from the database
    const usedBounties = await db.select().from(bounties);
    const usedBountyIds = new Set(usedBounties.map((b) => b.id));

    // Check available bounties of each type
    const availableWildcards = bountiesJSON.filter((b: any) => b.wildcard && !usedBountyIds.has(b.id));
    const availableNormal = bountiesJSON.filter((b: any) => !b.wildcard && !usedBountyIds.has(b.id));

    // Determine which type to use based on availability
    let isWildcard = false;
    if (availableWildcards.length === 0 && availableNormal.length === 0) {
        // If all bounties used, none
        return null;
    } else if (availableWildcards.length === 0) {
        // No wildcards left, always use normal
        isWildcard = false;
    } else if (availableNormal.length === 0) {
        // No normal bounties left, always use wildcard
        isWildcard = true;
    } else {
        // Otherwise 50/50
        isWildcard = Math.random() < 0.5;
    }

    // TODO simplify this by using previous filter probs
    const bountyPool = bountiesJSON.filter((b: any) => (isWildcard ? b.wildcard : !b.wildcard));
    const availableBounties = bountyPool.filter((b: any) => !usedBountyIds.has(b.id));
    const filteredPool = availableBounties.length > 0 ? availableBounties : bountyPool;

    const randomBounty = filteredPool[Math.floor(Math.random() * filteredPool.length)];

    return {
        id: randomBounty.id,
        description: randomBounty.description,
        wildcard: randomBounty.wildcard,
        negative: randomBounty.negative,
        reward: randomBounty.reward,
        penalty: randomBounty.penalty
    };
};
