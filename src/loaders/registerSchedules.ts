import BotClient from "@/structures/BotClient";
import { sendBounty } from "@/utils/bounties";
import cron from "node-cron";

export default (client: BotClient) => {
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
};
