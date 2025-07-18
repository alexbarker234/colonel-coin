import { randomJoin } from "@/features/voiceChannel";
import { SlashCommandHandler } from "@/types";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("forcejoinchannel")
        .setDescription("Force a the bot to join a channel and play audio"),
    debug: true,
    async execute(interaction: CommandInteraction) {
        if (!interaction.channel || !interaction.channel.isTextBased()) {
            await interaction.reply({ content: "This command can only be used in a text channel!", ephemeral: true });
            return;
        }

        await randomJoin(interaction.client, 1);
        interaction.reply({ content: "Bot joined channel and playing audio!", ephemeral: true });
    }
} satisfies SlashCommandHandler;
