import { EventHandler } from "@/types";
import { ActivityType, Client, Events } from "discord.js";

export default {
    name: Events.ClientReady,
    execute: async (client: Client) => {
        if (!client.user || !client.application) return;

        console.log(`${client.user.username} is online`);
        client.user.setActivity("you", { type: ActivityType.Listening });
    }
} satisfies EventHandler;
