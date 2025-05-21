import { getUser } from "@/utils/user";
import { Client, Message } from "discord.js";

module.exports = async (client: Client, message: Message) => {
    if (message.author.bot) return;

    const user = await getUser(message.author.id);
};
