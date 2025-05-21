import { createPointGame } from "@/features/bounties/pointGame";
import { SlashCommandHandler } from "@/types";
import { CommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder().setName("forcepointgame").setDescription("Force a point game to send"),
    debug: true,
    async execute(interaction: CommandInteraction) {
        if (!interaction.channel || !interaction.channel.isTextBased()) {
            await interaction.reply({
                content: "This command can only be used in a text channel!",
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        await createPointGame(interaction.client, interaction.channel);
        interaction.reply({ content: "Point game sent!", flags: MessageFlags.Ephemeral });
    }
} satisfies SlashCommandHandler;
