import { InteractionHandler } from "@/types";
import { EmbedBuilder, MessageFlags } from "discord.js";

export default {
    customId: "point_game_info",
    execute: async (interaction) => {
        if (!interaction.isButton()) return;
        const embed = new EmbedBuilder()
            .setTitle("🗺️ Map Rush Info")
            .setDescription(
                "Map Rush is a game where you visit locations around Perth to claim locations and earn rewards!"
            )
            .setColor("#5865F2")
            .addFields([
                {
                    name: "🎯 How to Play",
                    value: "View the map website to see available locations and claim them by visiting in person.",
                    inline: false
                },
                {
                    name: "⏰ Cooldown",
                    value: "Each location can only be claimed once every 2 days.",
                    inline: false
                },
                {
                    name: "💎 Points",
                    value: "Every hour you get points for the amount of locations you own.",
                    inline: false
                }
            ]);

        await interaction.reply({
            embeds: [embed],
            flags: MessageFlags.Ephemeral
        });
    }
} satisfies InteractionHandler;
