import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export interface SlashCommand {
    data: SlashCommandBuilder;
    type?: string;
    execute: (interaction: CommandInteraction) => Promise<void>;
}
