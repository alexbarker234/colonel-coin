import { sendBounty } from "@/features/bounties/bounties";
import { updateButtonGames } from "@/features/bounties/buttonGame";
import { updatePointGames } from "@/features/bounties/pointGame";
import { deleteExpiredTokens } from "@/features/loginTokens";
import { randomJoin } from "@/features/voiceChannel";
import { bountySchedule, db, eq } from "database";
import { Client } from "discord.js";
import cron from "node-cron";

export default (client: Client) => {
    // at 12AM every 2 days choose a random time on that day to send the bounty
    cron.schedule(
        "0 0 */2 * *",
        async () => {
            const randomTime = Math.floor(Math.random() * 24 * 60 * 60 * 1000);
            const nextScheduledTime = new Date(Date.now() + randomTime);

            // Save the next scheduled time to the database
            await db.insert(bountySchedule).values({ nextScheduledTime }).onConflictDoUpdate({
                target: bountySchedule.id,
                set: { nextScheduledTime }
            });

            sendBountyAtTime(client, nextScheduledTime);
        },
        { timezone: "Australia/Perth" }
    );

    // On bot startup, check if there's a pending bounty that needs to be sent
    const checkPendingBounty = async () => {
        const schedule = await db.select().from(bountySchedule).where(eq(bountySchedule.id, 1)).limit(1);
        if (schedule.length === 0) return;

        const { nextScheduledTime } = schedule[0];
        sendBountyAtTime(client, nextScheduledTime);
    };

    checkPendingBounty();

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

const sendBountyAtTime = async (client: Client, dateTime: Date) => {
    const now = new Date();
    if (dateTime > now) {
        const timeUntilBounty = dateTime.getTime() - now.getTime();
        console.log(`Scheduled bounty for ${dateTime.toLocaleString("en-AU", { timeZone: "Australia/Perth" })}`);

        setTimeout(() => {
            try {
                sendBounty(client);
            } catch (error) {
                console.error(error);
            }
        }, timeUntilBounty);
    }
};
