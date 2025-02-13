import { Client, ClientOptions, Collection} from "discord.js";
import { SlashCommand } from "@/types";

export default class BotClient extends Client {
    commands: Collection<string, SlashCommand>;
    constructor(options: ClientOptions) {
        super(options);
        this.commands = new Collection();
    }
}