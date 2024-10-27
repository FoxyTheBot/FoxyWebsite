import express from 'express';
import { database } from '../../client/app';
import RouterManager from './RouterManager';
import { Guild } from 'discordeno/*';

class GuildDashboardRoutes {
    router: express.Router;
    routerManager: RouterManager;

    constructor() {
        this.router = express.Router();
        this.routerManager = new RouterManager();
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get("/:lang/servers/data", this.routerManager.isAuthenticated, this.getServersData.bind(this));
        this.router.get("/:lang/servers/:id/data", this.routerManager.isAuthenticated, this.getServerConfig.bind(this));
        this.router.get("/:lang/servers/:id/channels", this.routerManager.isAuthenticated, this.getServerChannels.bind(this));
        this.router.post("/br/servers/:guildId/modules/welcomer", this.routerManager.isAuthenticated, this.saveWelcomerModule.bind(this));
        this.router.get("/:lang/servers/:id", this.routerManager.isAuthenticated, this.getGuildSettings.bind(this));

        this.router.post("/br/servers/:guildId/modules/welcomer", this.routerManager.isAuthenticated, this.saveWelcomerModule);

        this.router.use(this.routerManager.errorHandler);
    }

    getRouter() {
        return this.router;
    }


    checkUserPermissions(permission): boolean {
        return (permission & (8 | 32)) !== 0;
    }

    async getGuildSettings(req, res) {
        const guildId = req.params.id;
        const guildData = await database.getGuild(guildId);
        if (!guildData) {
            return res.redirect(`https://discord.com/oauth2/authorize?client_id=1006520438865801296&scope=bot+applications.commands&permissions=269872255&guild_id=${guildId}`)
        }

        try {
            const userGuilds = await fetch(`https://discord.com/api/users/@me/guilds`, {
                headers: {
                    authorization: `${req.session.oauth_type} ${req.session.bearer_token}`
                }
            });
            const guilds = await userGuilds.json();
            const currentGuild = guilds.find(g => g.id === guildId);
            if (!currentGuild || !currentGuild.permissions) {
                return res.redirect("/br/dashboard");
            }
            const isUserAuthorized = this.checkUserPermissions(Number(currentGuild.permissions));

            if (!isUserAuthorized) {
                return res.redirect("/br/dashboard");
            }

            res.status(200).render("../public/pages/dashboard/guild/modules/welcomer.ejs", {
                user: req.session.user_info,
                guildId,
            });
        } catch (error) {
            console.error('Erro ao buscar informações do servidor:', error);
            res.status(500).json({ message: 'Erro ao buscar informações do servidor.' });
        }
    }

    async saveWelcomerModule(req, res) {
        const { guildId } = req.params;
        const guildData = await database.getGuild(guildId);
        if (!guildData) {
            return res.redirect(`https://discord.com/oauth2/authorize?client_id=1006520438865801296&scope=bot+applications.commands&permissions=269872255&guild_id=${guildId}`)
        }

        const guildInfo = await fetch(`https://discord.com/api/guilds/${guildId}`, {
            headers: {
                authorization: `${req.session.oauth_type} ${req.session.bearer_token}`
            }
        });
        const guild = await guildInfo.json();

        const isUserAuthorized = this.checkUserPermissions(Number(guild.permissions));

        if (!isUserAuthorized) {
            return res.status(403).json({ message: 'Você não tem permissão para acessar este servidor.' });
        }
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

            guild.GuildJoinLeaveModule = {
                isEnabled: !!toggleWelcomeModule,
                joinMessage: JSON.stringify(joinMessage) || null,
                alertWhenUserLeaves: !!toggleGoodbyeModule,
                leaveMessage: JSON.stringify(leaveMessage) || null,
                joinChannel: welcomeChannel || guild.GuildJoinLeaveModule.joinChannel,
                leaveChannel: goodbyeChannel || guild.GuildJoinLeaveModule.leaveChannel
            };

            await guild.save();

            res.status(200).redirect(`/br/servers/${guildId}`);
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            res.status(500).json({ message: 'Erro ao salvar configurações.' });
        }
    }

    async getServersData(req, res) {
        const user = await req.session.user_info;
        try {
            const userGuilds = await fetch("https://discord.com/api/users/@me/guilds", {
                headers: {
                    authorization: `${req.session.oauth_type} ${req.session.bearer_token}`
                }
            });
            const guilds = await userGuilds.json();
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
        const guild = await database.getGuild(guildId);
        res.status(200).json(guild);
    }

    async getServerChannels(req, res) {
        const guildId = req.params.id;
        const channels = await fetch(`https://discord.com/api/guilds/${guildId}/channels`, {
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
}

export default GuildDashboardRoutes;
