import { SlashCommandHandler } from "@/types";
import { Client, RESTPostAPIChatInputApplicationCommandsJSONBody as CommandJSON, REST, Routes } from "discord.js";
import fs from "fs";
import { dirname, join } from "path";

export default (client: Client) => {
    const commandsJSON: CommandJSON[] = [];
    const debugCommandsJSON: CommandJSON[] = [];

    const rootDir = dirname(require.main?.filename || "");
    if (rootDir === ".") throw new Error("Root directory not found");

    const commandDirs = fs.readdirSync(join(rootDir, "commands"));
    for (const dirName of commandDirs) {
        const commandFiles = fs
            .readdirSync(join(rootDir, "commands", dirName))
            .filter((file: string) => file.endsWith(".ts"));
        for (const file of commandFiles) {
            const command: SlashCommandHandler = require(join(rootDir, "commands", dirName, `${file}`)).default;

            if ("data" in command && "execute" in command) {
                if (command.debug) {
                    debugCommandsJSON.push(command.data.toJSON());
                } else {
                    commandsJSON.push(command.data.toJSON());
                }
                client.commands.set(command.data.name, command);
            } else {
                console.log(`[WARNING] The command at ${file} is missing a required "data" or "execute" property.`);
            }
        }
    }

    registerCommands(commandsJSON, debugCommandsJSON);
};
function registerCommands(commandsJSON: CommandJSON[], debugCommandsJSON: CommandJSON[]) {
    const rest = new REST().setToken(process.env.BOT_TOKEN || "");
    (async () => {
        try {
            if (!process.env.CLIENT_ID) return console.log("No client id in .env");

            // Debug mode
            if (process.env.DEBUG) {
                if (!process.env.GUILD_ID) {
                    console.warn("[WARNING] No GUILD_ID in .env, commands cannot be registered in debug mode");
                } else {
                    const allCommands = [...commandsJSON, ...debugCommandsJSON];
                    if (allCommands.length > 0) {
                        const guildData: any = await rest.put(
                            Routes.applicationGuildCommands(process.env.CLIENT_ID || "", process.env.GUILD_ID),
                            { body: allCommands }
                        );
                        console.log(
                            `Successfully reloaded ${guildData.length} application (/) commands for guild ${process.env.GUILD_ID} in debug mode.`
                        );
                    }
                }
            }
            // Not debug mode
            else {
                // Register regular commands globally
                if (commandsJSON.length > 0) {
                    const globalData: any = await rest.put(Routes.applicationCommands(process.env.CLIENT_ID || ""), {
                        body: commandsJSON
                    });
                    console.log(`Successfully reloaded ${globalData.length} global application (/) commands.`);
                }

                // Register debug commands to guild only
                if (debugCommandsJSON.length > 0) {
                    if (!process.env.GUILD_ID) {
                        console.warn("[WARNING] No GUILD_ID in .env, debug commands won't be registered");
                    } else {
                        const guildData: any = await rest.put(
                            Routes.applicationGuildCommands(process.env.CLIENT_ID || "", process.env.GUILD_ID),
                            { body: debugCommandsJSON }
                        );
                        console.log(
                            `Successfully reloaded ${guildData.length} debug application (/) commands for guild ${process.env.GUILD_ID}.`
                        );
                    }
                }
            }

            console.log(
                `Total commands registered: ${commandsJSON.length} regular + ${debugCommandsJSON.length} debug`
            );
        } catch (error) {
            console.error(error);
        }
    })();
}
