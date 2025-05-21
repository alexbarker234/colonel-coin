import { EventHandler } from "@/types";
import { Client, Events, Interaction, MessageFlags } from "discord.js";

export default {
    name: Events.InteractionCreate,
    execute: async (client: Client, interaction: Interaction) => {
        if (interaction.isChatInputCommand()) {
            await handleSlashCommand(interaction);
        } else {
            await handleComponentInteraction(interaction);
        }
    }
} satisfies EventHandler;

const handleComponentInteraction = async (interaction: Interaction) => {
    if (!interaction.isMessageComponent()) return;

    const handler = interaction.client.interactionHandlers.get(interaction.customId);
    if (!handler) {
        console.error(`No interaction handler found for ${interaction.customId}`);
        return;
    }
    await handler.execute(interaction);
};

const handleSlashCommand = async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: "There was an error while executing this command!",
                flags: MessageFlags.Ephemeral
            });
        } else {
            await interaction.reply({
                content: "There was an error while executing this command!",
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
