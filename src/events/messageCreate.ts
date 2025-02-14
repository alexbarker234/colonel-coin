import BotClient from "@/structures/BotClient";
import { getUser } from "@/utils/user";
import { Message } from "discord.js";

module.exports = async (client: BotClient, message: Message) => {
    if (message.author.bot) return;

    const user = await getUser(message.author.id);  
};
