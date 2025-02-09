import { Router } from "express";
import RouterManager from "../../RouterUtils";
import { database } from "../../../../client/app";

export default class GetServerConfigRoute {
    private manager: RouterManager;

    constructor(route: Router) {
        this.manager = new RouterManager();
        route.get("/api/v1/servers/:id/data", this.manager.isAuthenticated, this.getServerConfig.bind(this));
    }

    async getServerConfig(req, res) {
        const guildId = req.params.id;
        const isRedirected = await this.manager.getUserCurrentGuild(req, res, guildId);
        if (isRedirected) return;
        const guild = await database.getGuild(guildId);
        const foxyVerseGuild = await database.getFoxyVerseGuild(guildId);
        const guildJson = {
            _id: guild._id,
            AutoRoleModule: guild.AutoRoleModule,
            GuildJoinLeaveModule: guild.GuildJoinLeaveModule,
            guildSettings: guild.guildSettings,
            antiRaidModule: guild.antiRaidModule,
            premiumKeys: guild.premiumKeys,
            dashboardLogs: guild.dashboardLogs,
            foxyVerseGuild
        }
        res.status(200).json(guildJson);
    }
}