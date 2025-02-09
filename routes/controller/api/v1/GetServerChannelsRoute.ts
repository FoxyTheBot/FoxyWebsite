import { Router } from "express";
import RouterManager from "../../RouterUtils";
import { constants } from "../../../../structures/constants";

export default class GetServerChannelsRoute {
    private manager: RouterManager;

    constructor(route: Router) {
        this.manager = new RouterManager(); 
        route.get("/api/v1/servers/:id/channels", this.manager.isAuthenticated, this.getServerChannels.bind(this));
    }

    async getServerChannels(req, res) {
        const guildId = req.params.id;
        const channels = await fetch(constants.GUILD_CHANNELS(guildId), {
            headers: {
                authorization: `Bot ${process.env.BOT_TOKEN}`
            }
        });

        let filteredChannels = [];
        for (const channel of await channels.json()) {
            if (channel.type === 0) {
                filteredChannels.push(channel);
            }
        }
        res.status(200).json({ channels: filteredChannels });
    }
}