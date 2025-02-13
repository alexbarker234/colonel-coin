import BotClient from "@/structures/BotClient";
import fs from "fs";

// ALL FILES IN /events MUST HAVE THEIR NAME CORRESPOND TO THEIR EVENT
export default (client: BotClient) => {
    const path = global.src + "/events";
    const eventFiles = fs.readdirSync(path);
    for (const eventFile of eventFiles) {
        const event = require(`${path}/${eventFile}`);
        const eventName = eventFile.split('.')[0];
        client.on(eventName, event.bind(null, client))
        console.log(`Registered event listener: ${eventName}`);
    }
};
