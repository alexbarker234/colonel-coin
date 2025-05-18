import { Bounty } from "@/types";
import { EmbedBuilder } from "discord.js";

const negativeChip: Bounty = {
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
};

export default negativeChip;
