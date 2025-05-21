import { handleButtonPress } from "@/features/bounties/buttonGame";
import { InteractionHandler } from "@/types";

export default {
    customId: "button_game",
    execute: async (interaction) => {
        if (!interaction.isButton()) return;
        await handleButtonPress(interaction);
    }
} satisfies InteractionHandler;
