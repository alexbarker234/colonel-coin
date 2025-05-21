import { Collection } from "discord.js";

import { Client } from "discord.js";
import { Bounty, InteractionHandler, SlashCommand } from "./types";

declare module "discord.js" {
    export interface Client {
        commands: Collection<string, SlashCommand>;
        bounties: Collection<number, Bounty>;
        interactionHandlers: Collection<string, InteractionHandler>;
    }
}
Client.prototype.commands = new Collection();
Client.prototype.bounties = new Collection();
Client.prototype.interactionHandlers = new Collection();
