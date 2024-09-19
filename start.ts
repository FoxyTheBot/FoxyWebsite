import { App } from './client/app';
import { logger } from './structures/logger';
require('dotenv').config({ path: "./.env"});
const client = new App(process.env.PORT);
client.startServer();

process.on('uncaughtException', (err) => {
    logger.criticalError(err);
});

process.on('unhandledRejection', (err) => {
    logger.error(err);
});