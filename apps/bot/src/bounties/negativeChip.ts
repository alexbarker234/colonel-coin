import { BountyHandler } from "@/types";
import { EmbedBuilder } from "discord.js";

export default {
    id: 29,
    modifyEmbed: (embed: EmbedBuilder) => {
        // RANDOM CHIP BOUNTY, choose the chip and add it as a field

        const chipColours = ["🟢 Green 🟢", "🔴 Red 🔴", "🔵 Blue 🔵", "⚫ Black ⚫", "⬜ White ⚫"];

        const randomChipColour = chipColours[Math.floor(Math.random() * chipColours.length)];
        embed.addFields({
            name: "Negative Chip",
            value: randomChipColour
        });
    }
} satisfies BountyHandler;
