import { Client } from "discord.js";
import fs from "fs";
import { dirname, join } from "path";

// ALL FILES IN /events MUST HAVE THEIR NAME CORRESPOND TO THEIR EVENT
export default (client: Client) => {
    const rootDir = dirname(require.main?.filename || "");
    if (rootDir === ".") throw new Error("Root directory not found");

    const path = join(rootDir, "events");
    const eventFiles = fs.readdirSync(path);
    for (const eventFile of eventFiles) {
        const event = require(`${path}/${eventFile}`);
        const eventName = eventFile.split(".")[0];
        client.on(eventName, event.bind(null, client));
        console.log(`Registered event listener: ${eventName}`);
    }
};
