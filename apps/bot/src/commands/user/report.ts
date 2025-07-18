import { SlashCommandHandler } from "@/types";
import { getUser } from "@/utils/userUtils";
import { and, db, eq, userGuilds } from "database";
import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("report")
        .setDescription("Report your current money balance")
        .addNumberOption((option) =>
            option.setName("amount").setDescription("The amount of money you have").setRequired(true)
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const amount = interaction.options.getNumber("amount", true);

        if (amount < 0) {
            await interaction.reply({
                content: "You cannot report a negative balance!",
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const guildId = interaction.guild?.id;
        const userId = interaction.user.id;

        if (!guildId || !userId) {
            await interaction.reply({
                content: "This command can only be used in a server!",
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        // ensure user exists
        await getUser(userId, guildId);

        await db
            .update(userGuilds)
            .set({ balance: amount })
            .where(and(eq(userGuilds.userId, userId), eq(userGuilds.guildId, guildId)));

        await interaction.reply({
            content: `Successfully updated your balance to ${amount}!`,
            flags: MessageFlags.Ephemeral
        });
    }
} satisfies SlashCommandHandler;
