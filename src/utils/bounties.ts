import { db } from "@/database/db";
import { bounties, guildSettings } from "@/database/schema";
import BotClient from "@/structures/BotClient";
import { ColorResolvable, EmbedBuilder, Guild } from "discord.js";
import { isNotNull } from "drizzle-orm";

interface Bounty {
    id: number;
    description: string;
    wildcard?: boolean;
    negative?: boolean;
}

export const sendBounty = async (client: BotClient) => {
    const guilds = client.guilds.cache;

    // Choose bounty
    const bounty = await chooseBounty();

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
    for (const guild of guildMap) {
        const channelId = guild[1].settings.bountiesChannelId;
        if (!channelId) continue;

        console.log(`Sending bounty to ${guild[1].guild.name} with id ${channelId}`);
        const channel = guild[1].guild.channels.cache.get(channelId);
        if (!channel) {
            console.log(`No channel found in ${guild[1].guild.name} with id ${channelId}`);
            continue;
        }
        if (!channel.isTextBased()) continue;

        channel.send({ embeds: [embed] });
    }

    // Update the DB with the chosen bounty
    await db.insert(bounties).values({
        id: bounty.id
    });
};

const createBountyEmbed = (bounty: Bounty) => {
    let color: ColorResolvable = "#3498db"; // Default blue
    if (bounty.negative) {
        color = "#e74c3c"; // Red
    } else if (bounty.wildcard) {
        color = "#9b59b6"; // Purple
    }

    return new EmbedBuilder()
        .setTitle(bounty.wildcard ? "🎲New Wildcard Bounty!" : "🎯 New Bounty!")
        .setDescription(bounty.description)
        .setColor(color)
        .setTimestamp();
};

const chooseBounty = async (): Promise<Bounty> => {
    const bountiesJSON = require("../bounties.json");
    const isWildcard = Math.random() < 0.5;
    const regularBounties = bountiesJSON.filter((b: any) => (isWildcard ? b.wildcard : !b.wildcard));

    // Get all previously used bounty IDs from the database
    const usedBounties = await db.select().from(bounties);

    const usedBountyIds = new Set(usedBounties.map((b) => b.id));

    // Filter out previously used bounties
    const availableBounties = regularBounties.filter((b: any) => !usedBountyIds.has(b.id));

    // If all bounties have been used, reset by using all regular bounties
    const filteredPool = availableBounties.length > 0 ? availableBounties : regularBounties;

    const randomBounty = filteredPool[Math.floor(Math.random() * filteredPool.length)];

    return {
        id: randomBounty.id,
        description: randomBounty.description,
        wildcard: randomBounty.wildcard,
        negative: randomBounty.negative
    };
};
