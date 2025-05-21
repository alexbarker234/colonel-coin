import { db, loginTokens } from "database";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    EmbedBuilder,
    MessageFlags,
    SlashCommandBuilder
} from "discord.js";

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

        const URL = `${process.env.WEB_URL}/api/login?token=${token[0].token}`;

        const embed = new EmbedBuilder()
            .setTitle("Website Login Link")
            .setDescription(`Click [here](${URL}) to login to the website.`)
            .setColor("#5865F2")
            .setFooter({ text: "Link expires in 24 hours. Do not share this link with others." });

        const button = new ButtonBuilder().setURL(URL).setLabel("Login to Website").setStyle(ButtonStyle.Link);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

        await interaction.reply({ embeds: [embed], components: [row], flags: MessageFlags.Ephemeral });
    }
};
