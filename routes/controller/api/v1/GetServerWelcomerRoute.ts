import { Router } from "express";
import { database } from "../../../../client/app";
import RouterManager from "../../RouterUtils";

export default class GetServerWelcomerRoute {
    private manager: RouterManager;
    
    constructor(route: Router) {
        this.manager = new RouterManager();
        route.get("/api/v1/servers/:id/welcomer", this.manager.isAuthenticated, this.getServerWelcomer.bind(this));
    }

    async getServerWelcomer(req, res) {
        const guildId = req.params.id;
        const guildData = await database.getGuild(guildId);

        if (!guildData) {
            return res.status(404).json({ message: 'Server not found.' });
        }

        this.manager.renderPartial(req, res, 'welcomer', true, {
            guildId,
            guildData
        });
    }
}