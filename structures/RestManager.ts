import { createBotConstants, createRestManager } from "discordeno";

export default class RestManager {
    public rest = createRestManager({
        // @ts-ignore
        token: process.env.BOT_TOKEN,
        version: 10,
    });
    public constants = createBotConstants();

    async getUser(userId: string) {
        return await this.rest.runMethod(this.rest, "GET", this.constants.routes.USER(userId));
    }
}