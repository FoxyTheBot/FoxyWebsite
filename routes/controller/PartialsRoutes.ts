import express from 'express';
import { client, database } from '../../client/app';
import RouterManager from './RouterManager';
import { constants } from '../../structures/constants';
import fetch from 'node-fetch-commonjs';

class PartialsRoutes {
    router: express.Router;
    routerManager: RouterManager;

    constructor() {
        this.router = express.Router();
        this.routerManager = new RouterManager();
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.use(this.routerManager.errorHandler);
        this.router.get("/partials/servers", this.routerManager.isAuthenticated, this.getServersData.bind(this));
        this.router.get("/partials/server/:id/welcomer", this.routerManager.isAuthenticated, this.getServerWelcomer.bind(this));
        this.router.get("/partials/server/:id/logs", this.routerManager.isAuthenticated, this.getServerLogs.bind(this));
        this.router.get("/partials/daily-shop", this.routerManager.isAuthenticated, this.getDailyShop.bind(this));
        this.router.get("/partials/user/background-inventory", this.routerManager.isAuthenticated, this.getUserBackgroundInventory.bind(this));
    }

    getRouter() {
        return this.router;
    }


    async getServerWelcomer(req, res) {
        const guildId = req.params.id;
        const guildData = await database.getGuild(guildId);

        if (!guildData) {
            return res.status(404).json({ message: 'Server not found.' });
        }

        this.routerManager.renderPartial(req, res, 'welcomer', true, {
            guildId,
            guildData
        });
    }

    async getServerLogs(req, res) {
        const guildId = req.params.id;
        const guildData = await database.getGuild(guildId);
        const logs = guildData.dashboardLogs;

        const logsWithUsernames = await Promise.all(
            logs.map(async (log) => {
                try {
                    const user = (await client).users.cache.get(log.authorId) || (await client).users.fetch(log.authorId);

                    const actionDescription = this.getAction(log.actionType);

                    return {
                        author: (await user).username,
                        authorId: log.authorId,
                        actionType: actionDescription,
                        date: log.date,
                        avatar: `https://cdn.discordapp.com/avatars/${log.authorId}/${(await user).avatar}.png`
                    };
                } catch (error) {
                    return {
                        author: 'Unknown',
                        authorId: log.authorId,
                        actionType: "Ação desconhecida",
                        date: log.date,
                        avatar: 'https://cdn.discordapp.com/embed/avatars/0.png'
                    };
                }
            })
        );

        this.routerManager.renderPartial(req, res, 'logs', true, {
            guildId,
            logs: logsWithUsernames
        });
    }

    private async getUserBackgroundInventory(req, res) {
        const userId = req.session.user_info.id;
        const userData = await database.getUser(userId);
        const backgrounds = await database.getAllBackgrounds();
        const userBackgrounds = await Promise.all(userData.userProfile.backgroundList.map(
            id => database.getBackground(id)));
        
        this.routerManager.renderPartial(req, res, 'background-inventory', false, {
            userBackgrounds,
            currentBackground: userData.userProfile.background,
            storeContent: backgrounds
        });
    }

    private async getDailyShop(req, res) {
        this.routerManager.renderPartial(req, res, 'daily-shop', false, {});
    }

    private getAction(action) {
        switch (action) {
            case "UPDATE_GENERAL_SETTINGS": {
                return "Atualizou as configurações gerais";
            }

            case "UPDATE_WELCOMER_MODULE": {
                return "Atualizou as configurações de mensagens de entrada/saída";
            }

            default: {
                return "Ação desconhecida";
            }
        }
    }

    async getServersData(req, res) {
        try {
            const guilds = await this.getUserGuilds(req);
            const authorizedGuilds = [];

            for (const guild of guilds) {
                if (this.routerManager.checkUserPermissions(Number(guild.permissions))) {
                    authorizedGuilds.push(guild);
                }
            }
            this.routerManager.renderPartial(req, res, 'servers', false, {
                guilds: authorizedGuilds
            });
        } catch (error) {
            console.error('Erro ao buscar informações dos servidores:', error);
            res.status(500).json({ message: 'Erro ao buscar informações dos servidores.' });
        }
    }

    private getUserGuilds(req): Promise<any> {
        return new Promise((resolve) => {
            setTimeout(async () => {
                const userGuilds = await fetch(constants.USER_GUILDS, {
                    headers: {
                        authorization: `${req.session.oauth_type} ${req.session.bearer_token}`
                    }
                });
                const guilds = await userGuilds.json();
                resolve(guilds);
            }, 500);
        });
    }
}


export default PartialsRoutes;