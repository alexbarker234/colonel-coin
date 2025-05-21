import { guildSettings } from "database";
import {
    ChatInputCommandInteraction,
    Client,
    EmbedBuilder,
    Events,
    Guild,
    Interaction,
    SlashCommandBuilder,
    SlashCommandOptionsOnlyBuilder
} from "discord.js";

export type GuildSettings = typeof guildSettings.$inferSelect;

export interface SlashCommandHandler {
    data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
    type?: string;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
    debug?: boolean;
}
export interface EventHandler {
    name: Events;
    execute: (client: Client, ...args: any[]) => Promise<void>;
}

export interface BountyHandler {
    id: number;
    modifyEmbed?: (embed: EmbedBuilder) => void;
    postSendBounty?: (client: Client, guild: Guild, settings: GuildSettings) => void;
}

export interface InteractionHandler {
    customId: string;
    execute: (interaction: Interaction) => Promise<void>;
}
