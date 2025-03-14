import BotClient from "@/structures/BotClient";
import { createButtonGame } from "@/utils/buttonGame";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder().setName("forcebuttongame").setDescription("Force a button game to send"),
    debug: true,
    async execute(interaction: CommandInteraction) {
        if (!interaction.channel || !interaction.channel.isTextBased()) {
            await interaction.reply({ content: "This command can only be used in a text channel!", ephemeral: true });
            return;
        }

        await createButtonGame(interaction.client as BotClient, interaction.channel);
        interaction.reply({ content: "Button game sent!", ephemeral: true });
    }
};
