import { CommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { db } from "../../database/db";
import { guildSettings } from "../../database/schema";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("bountychannel")
        .setDescription("Sets the current channel as the bounty announcement channel")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction: CommandInteraction) {
        if (!interaction.guildId || !interaction.channelId) {
            return await interaction.reply({
                content: "This command can only be used in a server!",
                ephemeral: true
            });
        }

        await db
            .insert(guildSettings)
            .values({
                id: interaction.guildId,
                bountiesChannelId: interaction.channelId
            })
            .onConflictDoUpdate({
                target: guildSettings.id,
                set: { bountiesChannelId: interaction.channelId }
            });

        await interaction.reply({
            content: `Successfully set <#${interaction.channelId}> as the bounty announcement channel!`,
            ephemeral: true
        });
    }
};
