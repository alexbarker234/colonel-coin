import BotClient from "@/structures/BotClient";

export default (client: BotClient) => {
    const guilds = client.guilds.cache;

    // Schedule a message to be sent at 12:00 PM daily
    // cron.schedule("0 12 * * *", () => {
    //     // Find all servers

    //     for (const guild of guilds) {
    //         // currently just using the first text channel found
    //         const channel = guild[1].channels.cache.find((c) => c.isTextBased());
    //         if (!channel) {
    //             console.log(`No text channel found in ${guild[1].name}`);
    //             continue;
    //         }
    //         channel.send("This is your scheduled 12 PM message!");
    //     }
    // });
};
