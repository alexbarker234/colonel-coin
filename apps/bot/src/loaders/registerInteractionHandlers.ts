import { InteractionHandler } from "@/types";
import { Client } from "discord.js";
import fs from "fs";
import { dirname, join } from "path";

export default (client: Client) => {
    const rootDir = dirname(require.main?.filename || "");
    if (rootDir === ".") throw new Error("Root directory not found");

    const path = join(rootDir, "interactionHandlers");
    const handlerFiles = fs.readdirSync(path).filter((file) => file.endsWith(".ts"));

    for (const handlerFile of handlerFiles) {
        const handler: InteractionHandler = require(`${path}/${handlerFile}`).default;
        if (!handler.customId) {
            console.log(`[WARNING] The interaction handler at ${handlerFile} is missing required "customId" field`);
            return;
        }

        client.interactionHandlers.set(handler.customId, handler);
        console.log(`Registered interaction handler: ${handler.customId}`);
    }
};
