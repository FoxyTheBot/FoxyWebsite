import express from 'express';
import { client, database, rest } from '../../client/app';
import RouterManager from './RouterManager';
import rateLimit from 'express-rate-limit';
import { logger } from '../../structures/logger';
import { constants } from '../../structures/constants';
import { FoxyGuild } from '../../types/Guild';
import { ActionType } from '../../types/dashboardLog';
import { ButtonStyle, ComponentType } from 'discord.js';
class APIRoutes {
    router: express.Router;
    routerManager: RouterManager;

    private testMessageLimiter = rateLimit({
        windowMs: 60 * 1000,
        max: 5,
        message: { message: 'Too many requests, please try again later.' },
        standardHeaders: true,
        legacyHeaders: false,
    });

    constructor() {
        this.router = express.Router();
        this.routerManager = new RouterManager();
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.use(this.routerManager.errorHandler);
        this.router.get("/api/v1/servers/:id/data", this.routerManager.isAuthenticated, this.getServerConfig.bind(this));
        this.router.get("/api/v1/servers/:id/welcomer/data", this.routerManager.isAuthenticated, this.getServerWelcomer.bind(this));
        this.router.get("/api/v1/servers/:id/channels", this.routerManager.isAuthenticated, this.getServerChannels.bind(this));
        this.router.post("/api/v1/servers/:guildId/modules/welcomer", this.routerManager.isAuthenticated, this.saveWelcomerModule.bind(this));
        this.router.post("/api/v1/servers/:guildId/modules/general", this.routerManager.isAuthenticated, this.saveGeneralSettings.bind(this));
        this.router.post(
            "/api/v1/servers/:guildId/modules/welcomer/test/module/:module",
            this.routerManager.isAuthenticated,
            this.testMessageLimiter,
            this.sendTestMessage.bind(this)
        );
    }

    getRouter() {
        return this.router;
    }

    async getServerConfig(req, res) {
        const guildId = req.params.id;
        const isRedirected = await this.routerManager.getUserCurrentGuild(req, res, guildId);
        if (isRedirected) return;
        const guild = await database.getGuild(guildId);
        res.status(200).json(guild);
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

    async getServerChannels(req, res) {
        const guildId = req.params.id;
        const channels = await fetch(constants.GUILD_CHANNELS(guildId), {
            headers: {
                authorization: `Bot ${process.env.BOT_TOKEN}`
            }
        });

        let filteredChannels = [];
        for (const channel of await channels.json()) {
            if (channel.type === 0) {
                filteredChannels.push(channel);
            }
        }
        res.status(200).json({ channels: filteredChannels });
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

    async sendTestMessage(req, res) {
        const { guildId, module } = req.params;
        const guildData = await database.getGuild(guildId);

        if (!guildData) {
            return res.status(404).json({ message: 'Server not found.' });
        }
        const isRedirected = await this.routerManager.getUserCurrentGuild(req, res, guildId);
        if (isRedirected) return;

        const currentSessionUser = req.session.user_info;

        const placeholders = this.getTestCompatiblePlaceholders(currentSessionUser);

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
            embedFooter,
            imageLink,
            goodbyeEmbedFooter,
            goodbyeImageLink
        } = req.body;

        const imageLinkRegex = /https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp)/;

        try {
            switch (module) {
                case 'welcomeModule': {
                    if (imageLink && imageLink  !== "" && !imageLinkRegex.test(imageLink)) {
                        return res.status(400).json({ message: 'Invalid image link.' });
                    }

                    const joinMessage = {
                        content: this.replacePlaceholders(messageContent, placeholders),
                        embeds: [
                            {
                                title: this.replacePlaceholders(embedTitle, placeholders) || null,
                                description: this.replacePlaceholders(embedDescription, placeholders),
                                color: parseInt(embedColor.replace('#', '0x')) || null,
                                thumbnail: welcomeShowAvatar
                                    ? { url: placeholders['{user.avatar}'] }
                                    : null,
                                fields: Array.isArray(embedFields) && embedFields.length > 0 ? embedFields : [],
                                image: imageLink ? { url: imageLink } : null,
                                footer: embedFooter ? { text: this.replacePlaceholders(embedFooter, placeholders) } : null
                            },
                        ].filter((embed) => embed.title || embed.description || embed.fields.length > 0),
                        components: [{
                            type: ComponentType.ActionRow,
                            components: [{
                                type: ComponentType.Button,
                                disabled: true,
                                label: "Mensagem enviada pelo painel",
                                emoji: {
                                    id: "1131035090277896232"
                                },
                                style: ButtonStyle.Secondary,
                                url: null,
                                custom_id: "im_gonna_highway_to_hell", // This is a joke, don't take it seriously
                            }]
                        }]
                    };

                    const joinChannel = welcomeChannel || guildData.GuildJoinLeaveModule.joinChannel;
                    if (!joinChannel) {
                        return res.status(400).json({ message: 'Welcome channel not found.' });
                    }
                    if (toggleWelcomeModule) {
                        await rest.sendMessageToAChannelAsJSON(joinChannel, JSON.stringify(joinMessage));
                    }

                    res.status(200).json({ message: 'Test message sent successfully.' });
                    break;
                }

                case 'goodbyeModule': {
                    if (goodbyeImageLink && goodbyeImageLink !== "" && !imageLinkRegex.test(goodbyeImageLink)) {
                        return res.status(400).json({ message: 'Invalid image link.' });
                    }
                    const leaveMessage = {
                        content: this.replacePlaceholders(goodbyeMessage, placeholders),
                        embeds: [
                            {
                                title: this.replacePlaceholders(goodbyeEmbedTitle, placeholders) || null,
                                description: this.replacePlaceholders(goodbyeEmbedDescription, placeholders),
                                color: parseInt(goodbyeEmbedColor.replace('#', '0x')) || null,
                                thumbnail: goodbyeShowAvatar
                                    ? { url: placeholders['{user.avatar}'] }
                                    : null,
                                image: goodbyeImageLink ? { url: goodbyeImageLink } : null,
                                fields: Array.isArray(goodbyeEmbedFields) && goodbyeEmbedFields.length > 0 ? goodbyeEmbedFields : [],
                                footer: embedFooter ? { text: this.replacePlaceholders(goodbyeEmbedFooter, placeholders) } : null
                            },
                        ].filter((embed) => embed.title || embed.description || embed.fields.length > 0),
                        components: [{
                            type: ComponentType.ActionRow,
                            components: [{
                                type: ComponentType.Button,
                                disabled: true,
                                label: "Mensagem enviada pelo painel",
                                emoji: {
                                    id: "1131035090277896232"
                                },
                                style: ButtonStyle.Secondary,
                                url: null,
                                custom_id: "im_gonna_highway_to_hell", // This is a joke, don't take it seriously
                            }]
                        }]
                    };

                    const leaveChannel = goodbyeChannel || guildData.GuildJoinLeaveModule.leaveChannel;
                    if (!leaveChannel) {
                        return res.status(400).json({ message: 'Goodbye channel not found.' });
                    }
                    if (toggleGoodbyeModule) {
                        await rest.sendMessageToAChannelAsJSON(leaveChannel, JSON.stringify(leaveMessage));
                    }

                    res.status(200).json({ message: 'Test message sent successfully.' });
                    break;
                }

                default:
                    return res.status(400);
            }
        } catch (error) {
            logger.error(error);
            res.status(500);
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

    private getTestCompatiblePlaceholders(user) {
        return {
            '{user}': user.username,
            '{@user}': `<@${user.id}>`,
            '{user.id}': user.id.toString(),
            '{user.avatar}': constants.USER_AVATAR(user.id, user.avatar) || '',
            '{guild.name}': "Servidor super incrível 💫"
        };
    }

    private replacePlaceholders(content, placeholders) {
        return Object.entries(placeholders).reduce(
            (result, [key, value]) => result.replace(new RegExp(key, 'g'), value),
            content
        );
    }

    async saveGeneralSettings(req, res) {
        const { guildId } = req.params;
        const guildData = await database.getGuild(guildId);

        if (!guildData) {
            return res.redirect(constants.INVITE_BOT(guildId))
        }

        try {
            const isRedirected = await this.routerManager.getUserCurrentGuild(req, res, guildId);
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
                premiumKeys: guildData.premiumKeys,
                dashboardLogs: guildData.dashboardLogs
            };

            await database.saveGuildSettings(guildId, updatedSettings);

            res.status(200).redirect(constants.SERVER_SETTINGS(guildId));
            return this.routerManager.saveToLog(req.session.user_info.id, guildId, ActionType.UPDATE_GENERAL_SETTINGS);
        } catch (err) {
            console.error('Erro ao salvar configurações:', err);
            res.status(500).json({ message: 'Erro ao salvar configurações.' });
        }
    }

    async saveWelcomerModule(req, res) {
        const { guildId } = req.params;
        const isRedirected = await this.routerManager.getUserCurrentGuild(req, res, guildId);
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
                guildSettings: guildData.guildSettings,
                premiumKeys: guildData.premiumKeys,
                dashboardLogs: guildData.dashboardLogs
            };


            await database.saveGuildSettings(guildId, updatedSettings);

            res.status(200).redirect(constants.SERVER_MODULES(guildId, "welcomer"));
            return this.routerManager.saveToLog(req.session.user_info.id, guildId, ActionType.UPDATE_WELCOMER_MODULE);
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            res.status(500).json({ message: 'Erro ao salvar configurações.' });
        }
    }

}


export default APIRoutes;