import { Router } from "express";
import RouterManager from "../RouterUtils";
import { database } from "../../../client/app";

export default class GetModuleRoute {
    private manager: RouterManager;

    constructor(route: Router) {
        this.manager = new RouterManager();
        route.use("/partials/server/:id/modules/:module", this.manager.isAuthenticated, this.getModule.bind(this));
    }

    async getModule(req, res) {
        const module = req.params.module;
        const guildId = req.params.id;
        const guildData = await database.getGuild(guildId);

        if (!guildData) {
            return res.status(404).json({ message: 'Module not found.' });
        }

        this.manager.renderPartial(req, res, module, true, {
            guildId,
            guildData
        });
    }
}