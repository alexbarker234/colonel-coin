import { BountyHandler } from "@/types";
import { getGamesChannel } from "@/utils/miscUtils";
import { createPointGame } from "@/utils/pointGame";

export default {
    id: 31,
    postSendBounty: async (client, guild, settings) => {
        const gamesChannel = await getGamesChannel(guild, settings);
        if (!gamesChannel) return;

        await createPointGame(client, gamesChannel);
    }
} satisfies BountyHandler;
