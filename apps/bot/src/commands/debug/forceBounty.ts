import { chooseBounty, sendBounty } from "@/features/bounties/bounties";
import { SlashCommandHandler } from "@/types";
import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("forcebounty")
        .setDescription("Force a bounty to be chosen")
        .addIntegerOption((option) =>
            option.setName("id").setDescription("The ID of the bounty to force").setRequired(false)
        )
        .addBooleanOption((option) =>
            option.setName("mark_as_used").setDescription("Whether to mark the bounty as used").setRequired(false)
        ),
    debug: true,
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            const id = interaction.options.getInteger("id");
            const markAsUsed = interaction.options.getBoolean("mark_as_used");
            const bounty = await chooseBounty(id ?? undefined);
            if (!bounty) {
                await interaction.reply({ content: "No bounty found", flags: MessageFlags.Ephemeral });
                return;
            }
            await sendBounty(interaction.client, bounty.id, markAsUsed ?? false);
            await interaction.reply({ content: "Bounty sent", flags: MessageFlags.Ephemeral });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "Error choosing bounty", flags: MessageFlags.Ephemeral });
        }
    }
} satisfies SlashCommandHandler;
