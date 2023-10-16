import { createBot, Bot, Intents, startBot } from 'discordeno';

require('dotenv').config();
const bot = createBot({
    // @ts-ignore Type string | undefined is not assignable to type 'string'
    token: process.env.BOT_TOKEN,
    intents: 0 as Intents, 
}) as Bot;

export { bot };

startBot(bot);