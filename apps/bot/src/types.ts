import BotClient from "@/structures/BotClient";
import { guildSettings } from "database";
import { CommandInteraction, EmbedBuilder, Guild, SlashCommandBuilder } from "discord.js";

export type GuildSettings = typeof guildSettings.$inferSelect;

export interface SlashCommand {
    data: SlashCommandBuilder;
    type?: string;
    execute: (interaction: CommandInteraction) => Promise<void>;
    debug?: boolean;
}

export interface Bounty {
    id: number;
    modifyEmbed?: (embed: EmbedBuilder) => void;
    postSendBounty?: (client: BotClient, guild: Guild, settings: GuildSettings) => void;
}
