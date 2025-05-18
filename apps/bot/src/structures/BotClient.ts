import { Bounty, SlashCommand } from "@/types";
import { Client, ClientOptions, Collection } from "discord.js";

export default class BotClient extends Client {
    commands: Collection<string, SlashCommand>;
    bounties: Collection<number, Bounty>;
    constructor(options: ClientOptions) {
        super(options);
        this.commands = new Collection();
        this.bounties = new Collection();
    }
}
