import { updatePointGames } from "@/features/bounties/pointGame";
import { SlashCommandHandler } from "@/types";
import { CommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder().setName("forcepointgameupdate").setDescription("Force a point game update"),
    debug: true,
    async execute(interaction: CommandInteraction) {
        await updatePointGames(interaction.client);
        interaction.reply({ content: "Point game updated!", flags: MessageFlags.Ephemeral });
    }
} satisfies SlashCommandHandler;
