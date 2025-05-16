import BotClient from "@/structures/BotClient";
import { createAudioPlayer, createAudioResource, joinVoiceChannel } from "@discordjs/voice";
import { VoiceBasedChannel } from "discord.js";
import { join } from "path";

const soundPath = join(__dirname, "../assets/augh.mp3");

export const randomJoin = async (client: BotClient) => {
    try {
        // Loop over each guild and find a voice channel with people
        for (const guild of client.guilds.cache.values()) {
            const channels = guild.channels.cache.filter((c) => c.isVoiceBased());
            for (const channel of channels.values()) {
                // Play with a 5% chance
                if (channel.members.size > 0 && Math.random() < 0.05) {
                    joinAndPlay(channel);
                    console.log(`Joining ${channel.name} and playing audio`);
                    break;
                }
            }
        }
    } catch (error) {
        console.error(error);
    }
};

const joinAndPlay = async (channel: VoiceBasedChannel) => {
    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator
    });

    const player = createAudioPlayer();

    const subscription = connection.subscribe(player);
    if (subscription) {
        const resource = createAudioResource(soundPath);
        player.play(resource);

        setTimeout(() => {
            player.stop();
            connection.destroy();
        }, 6000);
    }
};
