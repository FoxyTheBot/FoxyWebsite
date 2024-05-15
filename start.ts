import { App } from './client/app';
import { logger } from './structures/logger';
const client = new App(3000);
client.startServer();

process.on('uncaughtException', (err) => {
    logger.criticalError(err);
});

process.on('unhandledRejection', (err) => {
    logger.error(err);
});