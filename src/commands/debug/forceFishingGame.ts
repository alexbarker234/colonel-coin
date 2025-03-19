import BotClient from "@/structures/BotClient";
import { createFishingGame } from "@/utils/fishingGame";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder().setName("forcefishinggame").setDescription("Force a fishing game to send"),
    debug: true,
    async execute(interaction: CommandInteraction) {
        if (!interaction.channel || !interaction.channel.isTextBased()) {
            await interaction.reply({ content: "This command can only be used in a text channel!", ephemeral: true });
            return;
        }

        await createFishingGame(interaction.client as BotClient, interaction.channel);
        interaction.reply({ content: "Fishing game sent!", ephemeral: true });
    }
};
