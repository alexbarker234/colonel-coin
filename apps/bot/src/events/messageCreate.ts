import { EventHandler } from "@/types";
import { getUser } from "@/utils/user";
import { Client, Events, Message } from "discord.js";

export default {
    name: Events.MessageCreate,
    execute: async (client: Client, message: Message) => {
        if (message.author.bot) return;

        const user = await getUser(message.author.id);
    }
} satisfies EventHandler;
