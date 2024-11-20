import express from 'express';
import {database } from '../../client/app';
import RouterManager from './RouterManager';
import { logger } from '../../structures/logger';
import { constants } from '../../structures/constants';

class GuildDashboardRoutes {
    router: express.Router;
    routerManager: RouterManager;

    constructor() {
        this.router = express.Router();
        this.routerManager = new RouterManager();
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.use(this.routerManager.errorHandler);

        /* Guild settings pages */
        this.router.get("/:lang/servers/:id/:module", this.routerManager.isAuthenticated, (req, res) => {
            this.renderModulePage(req, res, req.params.module ?? "general", req.params.id);
        });
    }

    getRouter() {
        return this.router;
    }

    async renderModulePage(req, res, module, guildId) {
        const guildInfo = await database.getGuild(guildId);
        if (!guildInfo) {
            return res.redirect(constants.INVITE_BOT(guildId));
        }

        try {
            res.status(200).render(`../public/pages/dashboard/guild/modules/${module}.ejs`, {
                user: req.session.user_info,
                guildId: req.params.id
            });
        } catch (err) {
            logger.error(err);
        }
    }
}


export default GuildDashboardRoutes;