import express from 'express';
import { database, rest } from '../../client/app';
import RouterManager from './RouterManager';
import rateLimit from 'express-rate-limit';
import { logger } from '../../structures/logger';
import { constants } from '../../structures/constants';
import { FoxyGuild } from '../../types/Guild';

class GuildDashboardRoutes {
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

        /* Guild settings pages */
        this.router.get("/:lang/servers/:id", this.routerManager.isAuthenticated, (req, res) => {
            this.renderModulePage(req, res, "general", req.params.id);
        });

        this.router.get("/:lang/servers/:id/modules/:module", this.routerManager.isAuthenticated, (req, res) => {
            const { id, module } = req.params;
            this.renderModulePage(req, res, module, id);
        });
        /* Guild data */

        this.router.get("/:lang/user/servers/data", this.routerManager.isAuthenticated, this.getServersData.bind(this));
        this.router.get("/:lang/servers/:id/data", this.routerManager.isAuthenticated, this.getServerConfig.bind(this));
        this.router.get("/:lang/servers/:id/channels", this.routerManager.isAuthenticated, this.getServerChannels.bind(this));

        /* Save module settings */
        this.router.post("/:lang/servers/:guildId/modules/welcomer", this.routerManager.isAuthenticated, this.saveWelcomerModule.bind(this));
        this.router.post("/:lang/servers/:guildId/modules/general", this.routerManager.isAuthenticated, this.saveGeneralSettings.bind(this));
        this.router.post(
            "/:lang/servers/:guildId/modules/welcomer/test/module/:module",
            this.routerManager.isAuthenticated,
            this.testMessageLimiter,
            this.sendTestMessage.bind(this)
        );
    }

    getRouter() {
        return this.router;
    }


    checkUserPermissions(permission): boolean {
        return (permission & (8 | 32)) !== 0;
    }
    async renderModulePage(req, res, module, guildId) {
        const guildInfo = await database.getGuild(guildId);
        if (!guildInfo) {
            return res.redirect(constants.INVITE_BOT(guildId));
        }

        const isRedirected = await this.getUserCurrentGuild(req, res, guildId);
        if (isRedirected) return;

        try {
            res.status(200).render(`../public/pages/dashboard/guild/modules/${module}.ejs`, {
                user: req.session.user_info,
                guildId: req.params.id
            });
        } catch (err) {
            logger.error(err);
        }
    }

    async getUserCurrentGuild(req, res, guildId) {
        if (!guildId) throw new Error('Guild ID not found.');
        const guildInfo = await database.getGuild(guildId);

        if (!guildInfo) {
            res.redirect(constants.INVITE_BOT(guildId));
            return true;
        }

        let userGuildsResponse;
        let attempts = 0;

        while (attempts < 3) {
            userGuildsResponse = await fetch(constants.USER_GUILDS, {
                headers: {
                    authorization: `${req.session.oauth_type} ${req.session.bearer_token}`
                }
            });

            if (userGuildsResponse.status === 429) {
                const rateLimitData = await userGuildsResponse.json();
                const waitTime = rateLimitData.retry_after * 1000;
                await new Promise(resolve => setTimeout(resolve, waitTime));
                attempts++;
            } else {
                break;
            }
        }

        if (userGuildsResponse.status === 429) {
            logger.error("Rate limit exceeded. Please try again later.");
            return true;
        }

        const guilds = await userGuildsResponse.json();
        const currentGuild = guilds.find((g) => g.id === guildId);
        if (!currentGuild) {
            res.redirect(constants.DASHBOARD);
            return true;
        }

        const isUserAuthorized = this.checkUserPermissions(currentGuild.permissions);

        if (!currentGuild.permissions || !isUserAuthorized) {
            res.redirect(constants.DASHBOARD);
            return true;
        }

        return false;
    }

    async saveGeneralSettings(req, res) {
        const { guildId } = req.params;
        const guildData = await database.getGuild(guildId);

        if (!guildData) {
            return res.redirect(constants.INVITE_BOT(guildId))
        }

        try {
            const isRedirected = await this.getUserCurrentGuild(req, res, guildId);
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
        } catch (err) {
            console.error('Erro ao salvar configurações:', err);
            res.status(500).json({ message: 'Erro ao salvar configurações.' });
        }
    }

    async sendTestMessage(req, res) {
        const { guildId, module } = req.params;
        const guildData = await database.getGuild(guildId);

        if (!guildData) {
            return res.status(404).json({ message: 'Server not found.' });
        }
        const isRedirected = await this.getUserCurrentGuild(req, res, guildId);
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
        } = req.body;

        try {
            switch (module) {
                case 'welcomeModule': {
                    const joinMessage = {
                        content: this.replacePlaceholders(messageContent, placeholders),
                        embeds: [
                            {
                                title: embedTitle || null,
                                description: this.replacePlaceholders(embedDescription, placeholders),
                                color: parseInt(embedColor.replace('#', '0x')) || null,
                                thumbnail: welcomeShowAvatar
                                    ? { url: placeholders['{user.avatar}'] }
                                    : null,
                                fields: Array.isArray(embedFields) && embedFields.length > 0 ? embedFields : [],
                            },
                        ].filter((embed) => embed.title || embed.description || embed.fields.length > 0),
                        components: buttons?.length
                            ? [{ type: 1, components: buttons }]
                            : [],
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
                    const leaveMessage = {
                        content: this.replacePlaceholders(goodbyeMessage, placeholders),
                        embeds: [
                            {
                                title: goodbyeEmbedTitle || null,
                                description: this.replacePlaceholders(goodbyeEmbedDescription, placeholders),
                                color: parseInt(goodbyeEmbedColor.replace('#', '0x')) || null,
                                thumbnail: goodbyeShowAvatar
                                    ? { url: placeholders['{user.avatar}'] }
                                    : null,
                                fields: Array.isArray(goodbyeEmbedFields) && goodbyeEmbedFields.length > 0 ? goodbyeEmbedFields : [],
                            },
                        ].filter((embed) => embed.title || embed.description || embed.fields.length > 0),
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

    async saveWelcomerModule(req, res) {
        const { guildId } = req.params;
        const isRedirected = await this.getUserCurrentGuild(req, res, guildId);
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
            goodbyeButtons
        } = req.body;

        try {
            const joinMessage = {
                content: messageContent || "<@{user.id}>",
                embeds: [
                    {
                        title: embedTitle || null,
                        description: embedDescription || null,
                        color: parseInt(embedColor.replace('#', '0x')) || null,
                        thumbnail: welcomeShowAvatar ? { url: "{user.avatar}" } : null,
                        fields: Array.isArray(embedFields) && embedFields.length > 0 ? embedFields : []
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
                        fields: Array.isArray(goodbyeEmbedFields) && goodbyeEmbedFields.length > 0 ? goodbyeEmbedFields : []
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
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            res.status(500).json({ message: 'Erro ao salvar configurações.' });
        }
    }

    async getServersData(req, res) {
        const user = await req.session.user_info;
        try {
            const guilds = await this.getUserGuilds(req);
            const authorizedGuilds = [];

            for (const guild of guilds) {
                if (this.checkUserPermissions(Number(guild.permissions))) {
                    authorizedGuilds.push(guild);
                }
            }
            res.status(200).json({ user, guilds: authorizedGuilds });
        } catch (error) {
            console.error('Erro ao buscar informações dos servidores:', error);
            res.status(500).json({ message: 'Erro ao buscar informações dos servidores.' });
        }
    }

    async getServerConfig(req, res) {
        const guildId = req.params.id;
        const isRedirected = await this.getUserCurrentGuild(req, res, guildId);
        if (isRedirected) return;
        const guild = await database.getGuild(guildId);
        res.status(200).json(guild);
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

    private getTestCompatiblePlaceholders(user) {
        return {
            '{user}': user.username,
            '{@user}': `<@${user.id}>`,
            '{user.id}': user.id.toString(),
            '{user.avatar}': constants.USER_AVATAR(user.id, user.avatar) || '',
        };
    }

    private replacePlaceholders(content, placeholders) {
        return Object.entries(placeholders).reduce(
            (result, [key, value]) => result.replace(new RegExp(key, 'g'), value),
            content
        );
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


export default GuildDashboardRoutes;