import { Router } from "express";
import RouterManager from "../RouterUtils";
import { constants } from "../../../structures/constants";

export default class GetServersDataRoute {
    private manager: RouterManager;

    constructor(route: Router) {
        this.manager = new RouterManager();
        route.get("/partials/servers", this.manager.isAuthenticated, this.getServersData.bind(this));
    }

    async getServersData(req, res) {
        try {
            const guilds = await this.getUserGuilds(req);
            const authorizedGuilds = [];

            for (const guild of guilds) {
                if (this.manager.checkUserPermissions(Number(guild.permissions))) {
                    authorizedGuilds.push(guild);
                }
            }
            this.manager.renderPartial(req, res, 'servers', false, {
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