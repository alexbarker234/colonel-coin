import { Bounty } from "@/types";
import { createButtonGame } from "@/utils/buttonGame";

const negativeChip: Bounty = {
    id: 28,
    postSendBounty: async (client, guild, settings) => {
        const gamesChannelId = settings.gamesChannelId;
        if (!gamesChannelId) {
            console.log(`No games channel set in ${guild.name} `);
            return;
        }

        const gamesChannel = guild.channels.cache.get(gamesChannelId);
        if (!gamesChannel) {
            console.log(`No games channel found in ${guild.name} with id ${gamesChannelId}`);
            return;
        }

        await createButtonGame(client, gamesChannel);
    }
};

export default negativeChip;
