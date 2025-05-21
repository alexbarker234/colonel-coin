import { Collection } from "discord.js";

import { Client } from "discord.js";
import { Bounty, SlashCommand } from "./types";

declare module "discord.js" {
    export interface Client {
        commands: Collection<string, SlashCommand>;
        bounties: Collection<number, Bounty>;
    }
}
Client.prototype.commands = new Collection();
Client.prototype.bounties = new Collection();
