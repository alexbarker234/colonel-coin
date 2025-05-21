// Load module augmentation for client
import { Client } from "discord.js";
import "./client";
import { logBountyInformation } from "./features/bounties/bounties";

import dotenv from "dotenv";
dotenv.config();

import registerBounties from "@/loaders/registerBounties";
import registerCommands from "@/loaders/registerCommands";
import registerListeners from "@/loaders/registerListeners";
import registerInteractionHandlers from "./loaders/registerInteractionHandlers";
import registerSchedules from "./loaders/registerSchedules";

const token = process.env.BOT_TOKEN;

console.log("Bot is starting...");

const client = new Client({
    intents: ["Guilds", "GuildMessages", "GuildMembers", "GuildVoiceStates"]
});

registerCommands(client);
registerListeners(client);
registerSchedules(client);
registerBounties(client);
registerInteractionHandlers(client);

logBountyInformation();

client.login(token);
