import { SlashCommandHandler } from "@/types";
import { createButtonGame } from "@/utils/buttonGame";
import { CommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder().setName("forcebuttongame").setDescription("Force a button game to send"),
    debug: true,
    async execute(interaction: CommandInteraction) {
        if (!interaction.channel || !interaction.channel.isTextBased()) {
            await interaction.reply({
                content: "This command can only be used in a text channel!",
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        await createButtonGame(interaction.client, interaction.channel);
        interaction.reply({ content: "Button game sent!", flags: MessageFlags.Ephemeral });
    }
} satisfies SlashCommandHandler;
