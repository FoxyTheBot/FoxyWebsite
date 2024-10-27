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
        this.router.get("/:lang/servers/:id/channels", this.routerManager.isAuthenticated, this.getServerChannels);
        this.router.get("/:lang/servers/:id", this.routerManager.isAuthenticated, async (req, res) => {
            const guildId = req.params.id;
            res.status(200).render("../public/pages/dashboard/guild/modules/welcomer.ejs", {
                user: req.session.user_info,
                guildId,
            });
        });;

        this.router.post("/br/servers/:guildId/modules/welcomer", this.routerManager.isAuthenticated, this.saveWelcomerModule);

        this.router.use(this.routerManager.errorHandler);
    }

    getRouter() {
        return this.router;
    }

    async saveWelcomerModule(req, res) {
        const { guildId } = req.params;
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
            goodbyeEmbedFields,
            goodbyeButtons
        } = req.body;
        console.log(req.body)
        try {
            const guild = await database.getGuild(guildId);
            if (!guild) {
                return res.status(404).json({ message: 'Servidor não encontrado.' });
            }

            const joinMessage = {
                content: messageContent || "<@{user.id}>",
                embeds: [
                    {
                        title: embedTitle || null,
                        description: embedDescription || null,
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
