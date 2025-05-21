import { Collection } from "discord.js";

import { Client } from "discord.js";
import { BountyHandler, InteractionHandler, SlashCommandHandler } from "./types";

declare module "discord.js" {
    export interface Client {
        commands: Collection<string, SlashCommandHandler>;
        bounties: Collection<number, BountyHandler>;
        interactionHandlers: Collection<string, InteractionHandler>;
    }
}
Client.prototype.commands = new Collection();
Client.prototype.bounties = new Collection();
Client.prototype.interactionHandlers = new Collection();
