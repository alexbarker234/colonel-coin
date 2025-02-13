import { CommandInteraction, Interaction, SlashCommandBuilder } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder().setName("coincheck").setDescription("Call a coin check"),
    async execute(interaction: CommandInteraction) {
        const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");

        // Get count of real users in guild
        const guild = interaction.guild;
        if (!guild) {
            await interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
            return;
        }
        const members = await guild.members.fetch();
        const humanCount = members.filter((member) => !member.user.bot).size;

        // build embed
        const embed = new EmbedBuilder().setTitle("Coin Check").setDescription(`${humanCount} people need to accept this coin check`).setColor("#FFD700");
        const acceptButton = new ButtonBuilder().setCustomId("accept_coincheck").setLabel("Accept").setStyle(ButtonStyle.Success);
        const rejectButton = new ButtonBuilder().setCustomId("reject_coincheck").setLabel("Reject").setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder().addComponents(acceptButton, rejectButton);

        // in memory storage
        const acceptedUsers = new Set();

        const response = await interaction.reply({
            embeds: [embed],
            components: [row],
            fetchReply: true,
        });

        const collector = response.createMessageComponentCollector({ time: 60000 });

        collector.on("collect", async (i) => {
            // MANAGE ACCEPTANCE
            if (i.customId === "accept_coincheck") {
                acceptedUsers.add(i.user.id);
                await i.deferUpdate();

                const updatedEmbed = EmbedBuilder.from(embed).setDescription(
                    `${acceptedUsers.size}/${humanCount} people have accepted\n\nAccepted by:\n${Array.from(acceptedUsers)
                        .map((id) => `<@${id}>`)
                        .join("\n")}`
                );

                await interaction.editReply({
                    embeds: [updatedEmbed],
                    components: [row],
                });

                if (acceptedUsers.size >= humanCount) {
                    collector.stop();
                    const finalEmbed = EmbedBuilder.from(updatedEmbed).setDescription(
                        `Coin check complete! All ${humanCount} people have accepted.\n\nAccepted by:\n${Array.from(acceptedUsers)
                            .map((id) => `<@${id}>`)
                            .join("\n")}`
                    );

                    await interaction.editReply({
                        embeds: [finalEmbed],
                        components: [],
                    });
                }
            }
            // MANAGE REJECTION
            else if (i.customId === "reject_coincheck") {
                collector.stop();
                await i.deferUpdate();

                const rejectedEmbed = EmbedBuilder.from(embed).setDescription(`Coin check rejected by <@${i.user.id}>`);

                await interaction.editReply({
                    embeds: [rejectedEmbed],
                    components: [],
                });
            }
        });

        collector.on("end", (collected, reason) => {
            if (reason === "time") {
                const timeoutEmbed = EmbedBuilder.from(embed).setDescription("Coin check timed out after 1 minute.");
                interaction.editReply({
                    embeds: [timeoutEmbed],
                    components: [],
                });
            }
        });
    },
};
