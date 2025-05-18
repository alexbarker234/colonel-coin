import BotClient from "@/structures/BotClient";
import { handleButtonPress } from "@/utils/buttonGame";
import { Interaction, MessageFlags } from "discord.js";

module.exports = async (client: BotClient, interaction: Interaction) => {
    await handleSlashCommand(interaction);
    await handleButtonPress(interaction);
};

const handleSlashCommand = async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = (interaction.client as BotClient).commands.get(interaction.commandName);

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
