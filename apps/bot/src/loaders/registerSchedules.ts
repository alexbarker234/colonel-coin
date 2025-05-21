import { sendBounty } from "@/utils/bounties";
import { updateButtonGames } from "@/utils/buttonGame";
import { deleteExpiredTokens } from "@/utils/loginTokens";
import { updatePointGames } from "@/utils/pointGame";
import { randomJoin } from "@/utils/voiceChannel";
import { Client } from "discord.js";
import cron from "node-cron";

export default (client: Client) => {
    // at 12AM every 2 days choose a random time on that day to send the bounty
    cron.schedule("0 0 */2 * *", () => {
        const randomTime = Math.floor(Math.random() * 24 * 60 * 60 * 1000);

        // DEBUG - LOG TIME
        const hours = Math.floor(randomTime / (60 * 60 * 1000));
        const minutes = Math.floor((randomTime % (60 * 60 * 1000)) / (60 * 1000));
        const ampm = hours >= 12 ? "PM" : "AM";
        const formattedHours = hours % 12 || 12;
        console.log(`The bounty will be sent at ${formattedHours}:${minutes.toString().padStart(2, "0")} ${ampm}`);

        setTimeout(() => {
            try {
                sendBounty(client);
            } catch (error) {
                console.error(error);
            }
        }, randomTime);
    });

    // Every 2 minutes
    cron.schedule("*/2 * * * *", async () => {
        // Update button game messages
        updateButtonGames(client);
        // Randomly join a channel and play audio :)
        randomJoin(client);
        // Delete expired login tokens
        deleteExpiredTokens();
    });

    // Every hour
    cron.schedule("0 * * * *", async () => {
        // Update point games
        updatePointGames(client);
    });
};
