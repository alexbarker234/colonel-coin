import { bounties, db } from "database";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder().setName("resetbounties").setDescription("Reset all bounties"),
    debug: true,
    async execute(interaction: CommandInteraction) {
        await db.delete(bounties);
        await interaction.reply({ content: "All bounties have been reset" });
    }
};
