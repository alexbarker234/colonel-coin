import { SlashCommandHandler } from "@/types";
import { bounties, db } from "database";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder().setName("resetbounties").setDescription("Reset all bounties"),
    debug: true,
    async execute(interaction: CommandInteraction) {
        await db.delete(bounties);
        await interaction.reply({ content: "All bounties have been reset" });
    }
} satisfies SlashCommandHandler;
