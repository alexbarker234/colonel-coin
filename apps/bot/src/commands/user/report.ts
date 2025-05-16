import { getUser } from "@/utils/user";
import { db, eq, users } from "database";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

module.exports = {
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
                ephemeral: true
            });
            return;
        }

        // ensure user exists
        await getUser(interaction.user.id);

        await db.update(users).set({ balance: amount }).where(eq(users.id, interaction.user.id));

        await interaction.reply({
            content: `Successfully updated your balance to ${amount}!`,
            ephemeral: true
        });
    }
};
