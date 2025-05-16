import { db, guildSettings } from "database";
import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setchannel")
        .setDescription("Sets the current channel as a specific channel")
        .addStringOption((option) =>
            option
                .setName("type")
                .setDescription("The type of channel to set")
                .setRequired(true)
                .addChoices({ name: "Bounty", value: "bounty" }, { name: "Games", value: "games" })
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.guildId || !interaction.channelId) {
            return await interaction.reply({
                content: "This command can only be used in a server!",
                ephemeral: true
            });
        }

        const type = interaction.options.getString("type");

        const channelField = type === "bounty" ? "bountiesChannelId" : "gamesChannelId";
        await db
            .insert(guildSettings)
            .values({
                id: interaction.guildId,
                [channelField]: interaction.channelId
            })
            .onConflictDoUpdate({
                target: guildSettings.id,
                set: { [channelField]: interaction.channelId }
            });

        await interaction.reply({
            content: `Successfully set <#${interaction.channelId}> as the ${type} announcement channel!`,
            ephemeral: true
        });
    }
};
