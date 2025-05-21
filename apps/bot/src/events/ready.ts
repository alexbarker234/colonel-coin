import { ActivityType, Client } from "discord.js";

module.exports = (client: Client) => {
    if (!client.user || !client.application) return;

    console.log(`${client.user.username} is online`);
    client.user.setActivity("you", { type: ActivityType.Listening });
};
