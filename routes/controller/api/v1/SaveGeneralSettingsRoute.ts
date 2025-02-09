import { Router } from "express";
import RouterManager from "../../RouterUtils";
import { database } from "../../../../client/app";
import { constants } from "../../../../structures/constants";
import { ActionType } from "../../../../types/dashboardLog";
import { FoxyGuild } from "../../../../types/Guild";

export default class SaveGeneralSettingsRoute {
    private manager: RouterManager;

    constructor(router: Router) {
        this.manager = new RouterManager();
        router.post("/api/v1/servers/:guildId/modules/general", this.manager.isAuthenticated, this.saveGeneralSettings.bind(this));
    }

    
    async saveGeneralSettings(req, res) {
        const { guildId } = req.params;
        const guildData = await database.getGuild(guildId);

        if (!guildData) {
            return res.redirect(constants.INVITE_BOT(guildId))
        }

        try {
            const isRedirected = await this.manager.getUserCurrentGuild(req, res, guildId);
            if (isRedirected) return;

            const {
                deleteMessageIfCommandIsExecuted,
                botPrefix,
                disabledCommands,
                blockedChannels,
                warnIfCommandIsExecutedInBlockedChannel
            } = req.body;

            const updatedSettings: FoxyGuild = {
                _id: guildData._id,
                AutoRoleModule: guildData.AutoRoleModule,
                GuildJoinLeaveModule: guildData.GuildJoinLeaveModule,
                guildSettings: {
                    prefix: botPrefix || guildData.guildSettings.prefix,
                    deleteMessageIfCommandIsExecuted: !!deleteMessageIfCommandIsExecuted,
                    disabledCommands: disabledCommands || guildData.guildSettings.disabledCommands,
                    blockedChannels: JSON.parse(blockedChannels) || guildData.guildSettings.blockedChannels,
                    sendMessageIfChannelIsBlocked: !!warnIfCommandIsExecutedInBlockedChannel,
                    usersWhoCanAccessDashboard: guildData.guildSettings.usersWhoCanAccessDashboard
                },
                antiRaidModule: guildData.antiRaidModule,
                premiumKeys: guildData.premiumKeys,
                dashboardLogs: guildData.dashboardLogs,
                guildAddedAt: guildData.guildAddedAt || BigInt(Date.now())
            };

            await database.saveGuildSettings(guildId, updatedSettings);

            res.status(200).redirect(constants.SERVER_SETTINGS(guildId));
            return this.manager.saveToLog(req.session.user_info.id, guildId, ActionType.UPDATE_GENERAL_SETTINGS);
        } catch (err) {
            console.error('Erro ao salvar configurações:', err);
            res.status(500).json({ message: 'Erro ao salvar configurações.' });
        }
    }
}