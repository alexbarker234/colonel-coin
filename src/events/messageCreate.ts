import { Message } from "discord.js";
// import { getUser, manageXP } from "@/utils/user";
import BotClient from "@/structures/BotClient";

module.exports = async (client: BotClient, message: Message) => {
    if (message.author.bot) return;

    // let dbUser = await getUser(message.author);
    // dbUser = await manageXP(dbUser);
};
