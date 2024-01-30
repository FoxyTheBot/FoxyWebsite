import { App } from './client/app';
const client = new App(3000);
client.startServer();

process.on('uncaughtException', (err) => {
    console.error(err);
});

process.on('unhandledRejection', (err) => {
    console.error(err);
});