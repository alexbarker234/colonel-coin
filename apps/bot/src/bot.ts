import dotenv from "dotenv";
dotenv.config();

import registerBounties from "@/loaders/registerBounties";
import registerCommands from "@/loaders/registerCommands";
import registerListeners from "@/loaders/registerListeners";
import BotClient from "@/structures/BotClient";
import registerSchedules from "./loaders/registerSchedules";

const token = process.env.BOT_TOKEN;

console.log("Bot is starting...");

const client = new BotClient({
    intents: ["Guilds", "GuildMessages", "GuildMembers", "GuildVoiceStates"]
});

registerCommands(client);
registerListeners(client);
registerSchedules(client);
registerBounties(client);

client.login(token);
