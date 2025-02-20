import dotenv from "dotenv";
dotenv.config();

import registerCommands from "@/loaders/registerCommands";
import registerListeners from "@/loaders/registerListeners";
import BotClient from "@/structures/BotClient";
import path from "path";
import registerSchedules from "./loaders/registerSchedules";

const token = process.env.BOT_TOKEN;

global.src = path.resolve(__dirname);

console.log("Bot is starting...");

const client = new BotClient({
    intents: ["Guilds", "GuildMessages", "GuildMembers"]
});

registerCommands(client);
registerListeners(client);
registerSchedules(client);

client.login(token);
