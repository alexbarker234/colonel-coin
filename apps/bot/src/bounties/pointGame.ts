import { Bounty } from "@/types";
import { getGamesChannel } from "@/utils/miscUtils";
import { createPointGame } from "@/utils/pointGame";

const pointGame: Bounty = {
    id: 31,
    postSendBounty: async (client, guild, settings) => {
        const gamesChannel = await getGamesChannel(guild, settings);
        if (!gamesChannel) return;

        await createPointGame(client, gamesChannel);
    }
};

export default pointGame;
