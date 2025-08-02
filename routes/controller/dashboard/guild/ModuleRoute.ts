import { database } from "../../../../client/app";
import { constants } from "../../../../structures/constants";
import { logger } from "../../../../structures/logger";
import RouterUtils from "../../RouterUtils";

export default class ModuleRoute {
    private manager: RouterUtils;

    constructor(route) {
        this.manager = new RouterUtils();
        route.get("/:lang/servers/:id/:module", this.manager.isAuthenticated, (req, res) => {
            this.renderModulePage(req, res, req.params.module ?? "general", req.params.id);
        });
    }

    async renderModulePage(req, res, module, guildId) {
        const guildInfo = await database.getGuild(guildId);
        if (!guildInfo) {
            return res.redirect(constants.INVITE_BOT(guildId));
        }

        const foxyVerseGuild = await database.getFoxyVerseGuild(guildId);
        const guildJson = {
            _id: guildInfo._id,
            AutoRoleModule: guildInfo.AutoRoleModule,
            GuildJoinLeaveModule: guildInfo.GuildJoinLeaveModule,
            guildSettings: guildInfo.guildSettings,
            antiRaidModule: guildInfo.antiRaidModule,
            premiumKeys: guildInfo.premiumKeys,
            dashboardLogs: guildInfo.dashboardLogs,
            foxyVerseGuild
        }
        try {
            res.status(200).render(`../public/pages/dashboard/guild/modules/${module}.ejs`, {
                user: req.session.user_info,
                guildId: req.params.id,
                guildData: guildJson,
            });
        } catch (err) {
            logger.error(err);
        }
    }
}