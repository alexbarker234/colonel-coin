import { BountyHandler } from "@/types";
import { Client } from "discord.js";
import fs from "fs";
import { dirname, join } from "path";

export default (client: Client) => {
    const rootDir = dirname(require.main?.filename || "");
    if (rootDir === ".") throw new Error("Root directory not found");

    const path = join(rootDir, "bounties");
    const bountyFiles = fs.readdirSync(path).filter((file) => file.endsWith(".ts") && file !== "README.md");

    for (const bountyFile of bountyFiles) {
        const bounty: BountyHandler = require(`${path}/${bountyFile}`).default;
        if (bounty.id) {
            client.bounties.set(bounty.id, bounty);
            console.log(`Registered bounty: ${bountyFile} with id ${bounty.id}`);
        } else {
            console.log(`[WARNING] The bounty at ${bountyFile} is missing required "id" field`);
        }
    }
};
