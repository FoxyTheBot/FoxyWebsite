import { Router } from "express";
import RouterManager from "../../RouterUtils";
import rateLimit from "express-rate-limit";
import { database, rest } from "../../../../client/app";
import { ButtonStyle, ComponentType } from "discord.js";
import { logger } from "../../../../structures/logger";
import { constants } from "../../../../structures/constants";

export default class PostWelcomerTestRoute {
    private manager: RouterManager;
    private testMessageLimiter = rateLimit({
        windowMs: 60 * 1000,
        max: 5,
        message: { message: 'Too many requests, please try again later.' },
        standardHeaders: true,
        legacyHeaders: false,
    });

    constructor(route: Router) {
        this.manager = new RouterManager();
        route.post(
            "/api/v1/servers/:guildId/modules/welcomer/test/module/:module",
            this.manager.isAuthenticated,
            this.sendTestMessage.bind(this)
        );
    }

    async sendTestMessage(req, res) {
            const { guildId, module } = req.params;
            const guildData = await database.getGuild(guildId);
    
            if (!guildData) {
                return res.status(404).json({ message: 'Server not found.' });
            }
            const isRedirected = await this.manager.getUserCurrentGuild(req, res, guildId);
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
}