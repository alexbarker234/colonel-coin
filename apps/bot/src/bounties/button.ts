import { BountyHandler } from "@/types";
import { createButtonGame } from "@/utils/buttonGame";
import { getGamesChannel } from "@/utils/miscUtils";

export default {
    id: 28,
    postSendBounty: async (client, guild, settings) => {
        const gamesChannel = await getGamesChannel(guild, settings);
        if (!gamesChannel) return;

        await createButtonGame(client, gamesChannel);
    }
} satisfies BountyHandler;
