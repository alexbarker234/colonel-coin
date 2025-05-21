import { guildSettings } from "database";
import { Client, CommandInteraction, EmbedBuilder, Guild, SlashCommandBuilder } from "discord.js";

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
    postSendBounty?: (client: Client, guild: Guild, settings: GuildSettings) => void;
}
