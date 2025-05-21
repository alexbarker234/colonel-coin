import { InteractionHandler } from "@/types";
import { handleButtonPress } from "@/utils/buttonGame";

export default {
    customId: "button_game",
    execute: async (interaction) => {
        if (!interaction.isButton()) return;
        await handleButtonPress(interaction);
    }
} satisfies InteractionHandler;
