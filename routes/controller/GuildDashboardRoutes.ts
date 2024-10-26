import express from 'express';
import { database } from '../../client/app';
import RouterManager from './RouterManager';

class GuildDashboardRoutes {
    router: express.Router;
    routerManager: RouterManager;

    constructor() {
        this.router = express.Router();
        this.routerManager = new RouterManager();
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get("/:lang/servers/data", this.routerManager.isAuthenticated, this.getServersData);
        this.router.get("/:lang/servers/:id/data", this.routerManager.isAuthenticated, this.getServerConfig);

        this.router.get("/:lang/servers/:id", this.routerManager.isAuthenticated, async (req, res) => {
            const guildId = req.params.id;
            res.status(200).render("../public/pages/dashboard/guild/modules/welcomer.ejs", {
                user: req.session.user_info,
                guildId,
            });
        });;
        this.router.use(this.routerManager.errorHandler);
    }

    getRouter() {
        return this.router;
    }
    async getServersData(req, res) {
        const user = await req.session.user_info;
        const userGuilds = await fetch("https://discord.com/api/users/@me/guilds", {
            headers: {
                authorization: `${req.session.oauth_type} ${req.session.bearer_token}`
            }
        });
        const guilds = await userGuilds.json();
        const authorizedGuilds = [];

        function hasRequiredPermissions(permissions: number): boolean {
            return (permissions & (8 | 32)) !== 0;
        }

        for (const guild of guilds) {
            if (hasRequiredPermissions(Number(guild.permissions))) {
                authorizedGuilds.push(guild);
            }
        }
        res.status(200).json({ user, guilds: authorizedGuilds });
    }

    async getServerConfig(req, res) {
        const guildId = req.params.id;
        const guild = await database.getGuild(guildId);
        res.status(200).json(guild);
    }
}

export default GuildDashboardRoutes;
