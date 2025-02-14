import BotClient from "@/structures/BotClient";
import fs from "fs";
import { REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes } from "discord.js";
import { SlashCommand } from "@/types";

export default (client: BotClient) => {
    // WHAAAAT THE HECK ISS THISS NAMMMMEE????>!!
    const commandsJSON: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

    const commandDirs = fs.readdirSync(global.src + "/commands/");
    for (const dirName of commandDirs) {
        const commandFiles = fs
            .readdirSync(global.src + "/commands/" + dirName + "/")
            .filter((file: string) => file.endsWith(".ts"));
        for (const file of commandFiles) {
            const command: SlashCommand = require(global.src + "/commands/" + dirName + "/" + `${file}`);

            //command.type = dirName;

            if ("data" in command && "execute" in command) {
                commandsJSON.push(command.data.toJSON());
                client.commands.set(command.data.name, command);
            } else {
                console.log(`[WARNING] The command at ${file} is missing a required "data" or "execute" property.`);
            }
        }
    }

    registerCommands(commandsJSON);
};
function registerCommands(commandsJSON: RESTPostAPIChatInputApplicationCommandsJSONBody[]) {
    const rest = new REST().setToken(process.env.BOT_TOKEN || "");
    (async () => {
        try {
            if (!process.env.CLIENT_ID) return console.log("No client id in .env");

            let data: any;
            if (process.env.GUILD_ID) {
                data = await rest.put(
                    Routes.applicationGuildCommands(process.env.CLIENT_ID || "", process.env.GUILD_ID),
                    { body: commandsJSON }
                );
                console.log(`Reloading commands for ${process.env.GUILD_ID} only`);
            } else
                data = await rest.put(Routes.applicationCommands(process.env.CLIENT_ID || ""), { body: commandsJSON });

            console.log(`Successfully reloaded ${data.length} application (/) commands.`);
        } catch (error) {
            console.error(error);
        }
    })();
}
