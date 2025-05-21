import { EventHandler } from "@/types";
import { Client } from "discord.js";
import fs from "fs";
import { dirname, join } from "path";

// ALL FILES IN /events MUST HAVE THEIR NAME CORRESPOND TO THEIR EVENT
export default (client: Client) => {
    const rootDir = dirname(require.main?.filename || "");
    if (rootDir === ".") throw new Error("Root directory not found");

    const path = join(rootDir, "events");
    const eventFiles = fs.readdirSync(path);
    console.log("Registering event listeners:");
    for (const eventFile of eventFiles) {
        const event: EventHandler = require(join(path, eventFile)).default;
        client.on(event.name as string, event.execute.bind(null, client));
        console.log(`- ${event.name}`);
    }
};
