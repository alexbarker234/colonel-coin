import { chooseBounty, createBountyEmbed } from "@/utils/bounties";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
module.exports = {
    data: new SlashCommandBuilder()
        .setName("forcebounty")
        .setDescription("Force a bounty to be chosen")
        .addIntegerOption((option) =>
            option.setName("id").setDescription("The ID of the bounty to force").setRequired(false)
        ),
    debug: true,
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            const id = interaction.options.getInteger("id");
            const bounty = await chooseBounty(id ?? undefined);
            if (!bounty) {
                await interaction.reply({ content: "No bounty found", ephemeral: true });
                return;
            }
            const embed = createBountyEmbed(bounty);
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "Error choosing bounty", ephemeral: true });
        }
    }
};
