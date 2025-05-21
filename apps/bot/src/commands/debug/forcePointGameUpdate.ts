import { updatePointGames } from "@/utils/pointGame";
import { CommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder().setName("forcepointgameupdate").setDescription("Force a point game update"),
    debug: true,
    async execute(interaction: CommandInteraction) {
        await updatePointGames(interaction.client);
        interaction.reply({ content: "Point game updated!", flags: MessageFlags.Ephemeral });
    }
};
