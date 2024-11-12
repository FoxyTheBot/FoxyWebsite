import { Client } from "discord.js";
import { logger } from "../structures/logger";

export default class DiscordClient {
    constructor() { }

    async startClient() {
        const client = new Client({
            intents: ['Guilds', 'GuildMessages'],
        });

        client.on('ready', () => {
            logger.info(`[DISCORD] Logged in as ${client.user.tag}`);
        });

        client.login(process.env.BOT_TOKEN);

        return client;
    }
}