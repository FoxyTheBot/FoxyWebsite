import { Router } from "express";
import RouterManager from "../RouterUtils";
import { client, database } from "../../../client/app";

export default class GetServerLogsRoute {
    private manager: RouterManager;

    constructor(route: Router) {
        this.manager = new RouterManager();
        route.get("/partials/server/:id/logs", this.manager.isAuthenticated, this.getServerLogs.bind(this));
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

        this.manager.renderPartial(req, res, 'logs', true, {
            guildId,
            logs: logsWithUsernames
        });
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
}