import { chooseBounty, createBountyEmbed } from "@/utils/bounties";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder().setName("forcebounty").setDescription("Force a bounty to be chosen"),
    debug: true,
    async execute(interaction: CommandInteraction) {
        const bounty = await chooseBounty();
        const embed = createBountyEmbed(bounty);
        await interaction.reply({ embeds: [embed] });
    }
};
