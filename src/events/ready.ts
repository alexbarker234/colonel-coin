import { ActivityType, Client } from "discord.js";
import BotClient from "@/structures/BotClient";

module.exports = (client: BotClient) => {
    if (!client.user || !client.application) return;

    console.log(`${client.user.username} is online`);
    client.user.setActivity("you", { type: ActivityType.Listening });
};
