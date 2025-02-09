import { Router } from "express";
import RouterManager from "../../RouterUtils";
import { database } from "../../../../client/app";
import { FoxyGuild } from "../../../../types/Guild";
import { constants } from "../../../../structures/constants";
import { ActionType } from "../../../../types/dashboardLog";

export default class SaveWelcomerModuleRoute {
    private manager: RouterManager;

    constructor(route: Router) {
        this.manager = new RouterManager();
        route.post("/api/v1/servers/:guildId/modules/welcomer", this.manager.isAuthenticated, this.saveWelcomerModule.bind(this));
    }

    async saveWelcomerModule(req, res) {
        const { guildId } = req.params;
        const isRedirected = await this.manager.getUserCurrentGuild(req, res, guildId);
        if (isRedirected) return;

        const guildData = await database.getGuild(guildId);

        const {
            welcomeChannel,
            toggleWelcomeModule,
            toggleGoodbyeModule,
            messageContent,
            embedTitle,
            embedDescription,
            embedColor,
            goodbyeChannel,
            goodbyeMessage,
            goodbyeEmbedTitle,
            goodbyeEmbedDescription,
            goodbyeEmbedColor,
            embedFields,
            buttons,
            welcomeShowAvatar,
            goodbyeShowAvatar,
            goodbyeEmbedFields,
            goodbyeButtons,
            embedFooter,
            goodbyeEmbedFooter,
            imageLink,
            goodbyeImageLink
        } = req.body;

        try {
            if (imageLink && !/https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp)/.test(imageLink)) {
                return res.status(400).json({ message: 'Invalid image link.' });
            } else if (goodbyeImageLink && !/https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp)/.test(goodbyeImageLink)) {
                return res.status(400).json({ message: 'Invalid image link.' });
            }

            const joinMessage = {
                content: messageContent || "<@{user.id}>",
                embeds: [
                    {
                        title: embedTitle || null,
                        description: embedDescription || null,
                        color: parseInt(embedColor.replace('#', '0x')) || null,
                        thumbnail: welcomeShowAvatar ? { url: "{user.avatar}" } : null,
                        image: imageLink ? { url: imageLink } : null,
                        fields: Array.isArray(embedFields) && embedFields.length > 0 ? embedFields : [],
                        footer: embedFooter ? { text: embedFooter } : null
                    }
                ].filter(embed => embed.title || embed.description || embed.fields.length > 0),
                components: buttons && buttons.length > 0 ? {
                    type: 1,
                    components: buttons
                } : []
            };

            const leaveMessage = {
                content: goodbyeMessage || "<@{user.id}> saiu!",
                embeds: [
                    {
                        title: goodbyeEmbedTitle || null,
                        description: goodbyeEmbedDescription || null,
                        color: parseInt(goodbyeEmbedColor.replace('#', '0x')) || null,
                        thumbnail: goodbyeShowAvatar ? { url: "{user.avatar}" } : null,
                        image: goodbyeImageLink ? { url: goodbyeImageLink } : null,
                        fields: Array.isArray(goodbyeEmbedFields) && goodbyeEmbedFields.length > 0 ? goodbyeEmbedFields : [],
                        footer: embedFooter ? { text: goodbyeEmbedFooter } : null
                    }
                ].filter(embed => embed.title || embed.description || embed.fields.length > 0),
                components: goodbyeButtons && goodbyeButtons.length > 0 ? {
                    type: 1,
                    components: goodbyeButtons
                } : []
            };

            const updatedSettings: FoxyGuild = {
                _id: guildData._id,
                AutoRoleModule: guildData.AutoRoleModule,
                GuildJoinLeaveModule: {
                    isEnabled: !!toggleWelcomeModule,
                    joinMessage: JSON.stringify(joinMessage) || null,
                    alertWhenUserLeaves: !!toggleGoodbyeModule,
                    leaveMessage: JSON.stringify(leaveMessage) || null,
                    joinChannel: welcomeChannel || guildData.GuildJoinLeaveModule.joinChannel,
                    leaveChannel: goodbyeChannel || guildData.GuildJoinLeaveModule.leaveChannel
                },
                antiRaidModule: guildData.antiRaidModule,
                guildSettings: guildData.guildSettings,
                premiumKeys: guildData.premiumKeys,
                dashboardLogs: guildData.dashboardLogs,
                guildAddedAt: guildData.guildAddedAt || BigInt(Date.now())
            };


            await database.saveGuildSettings(guildId, updatedSettings);

            res.status(200).redirect(constants.SERVER_MODULES(guildId, "welcomer"));
            return this.manager.saveToLog(req.session.user_info.id, guildId, ActionType.UPDATE_WELCOMER_MODULE);
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            res.status(500).json({ message: 'Erro ao salvar configurações.' });
        }
    }
}