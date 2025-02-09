import { Router } from "express";
import RouterManager from "../../RouterUtils";
import { database } from "../../../../client/app";

export default class GetServerAntiRaidRoute {
    private manager: RouterManager;

    constructor(route: Router) {
        this.manager = new RouterManager();
        route.get("/api/v1/servers/:id/antiraid/data", this.manager.isAuthenticated, this.getServerAntiRaid.bind(this));
    }

    async getServerAntiRaid(req, res) {
        const guildId = req.params.id;
        const guildData = await database.getGuild(guildId);

        if (!guildData) {
            return res.status(404).json({ message: 'Server not found.' });
        }

        res.status(200).json(guildData.antiRaidModule);
    }
}