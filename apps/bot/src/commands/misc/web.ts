import { db } from "database";
import { loginTokens } from "database/schema";
import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder().setName("web").setDescription("Get a login link for the website"),
    async execute(interaction: CommandInteraction) {
        const token = await db
            .insert(loginTokens)
            .values({
                token: crypto.randomUUID(),
                userId: interaction.user.id,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24)
            })
            .returning();

        const embed = new EmbedBuilder()
            .setTitle("Website Login Link")
            .setDescription(
                `Click [here](${process.env.WEB_URL}/api/login?token=${token[0].token}) to login to the website.`
            )
            .setColor("#5865F2")
            .setFooter({ text: "Link expires in 24 hours. Do not share this link with others." });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
