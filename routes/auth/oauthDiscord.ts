import express from 'express';
import fetch from 'node-fetch-commonjs';
import config from '../../config.json';
import { database, rest } from '../../client/app';
import { logger } from '../../structures/logger';
import dotenv from 'dotenv';
import User from '../../types/user';
import { constants } from '../../structures/constants';

dotenv.config();

const router = express.Router();

async function sendWelcomeMessage(userId, guildName) {
    try {
        await rest.sendDirectMessage(userId, {
            embeds: [{
                title: "<:foxy_cake:866084383843549204> **|** Obrigada por me adicionar!",
                color: 0xe7385d,
                description: 
                    `<:foxy_howdy:853366973751885854> **|** Olá <@${userId}>, obrigada por me adicionar no servidor **${guildName}**!` +
                    "\n\n" +
                    `<:foxy_yay:1070906796274888795> **|** Estou muito feliz por fazer parte da sua comunidade! ` +
                    "Se você está me conhecendo agora, eu sou a **Foxy**, um bot multiuso para Discord, pronta para ajudar você e seu servidor a se divertir e crescer! " +
                    "Além de entreter os membros, posso dar uma mãozinha no gerenciamento e proteção do servidor! :3" + 
                    "\n\n" +
                    `<:foxy_drinking_coffee:1071119512352591974> **|** Quer saber mais sobre mim? Confira meus comandos [clicando aqui](https://foxybot.win/br/commands)! ` +
                    "Se precisar de ajuda ou tiver alguma dúvida, você pode entrar no meu servidor de suporte; seria muito legal ter você lá!" +
                    "\n\n" +
                    `<:foxy_wow:853366914054881310> **|** Espero poder ajudar você e seu servidor a crescer e se divertir bastante!`,
                image: {
                    url: "https://cakey.foxybot.win/assets/banner-2.png"
                }
            }],
            components: [{
                type: 1,
                components: [{
                    type: 2,
                    style: 5,
                    label: "Servidor de Suporte",
                    url: "https://discord.gg/UbwQ3Ad56w",
                    emoji: { id: "866084383843549204" }
                }]
            }]
        });
    } catch (err) {
        logger.error("Is DM disabled?", err);
    }
}

router.get('/login/callback', async (req, res) => {
    const guildId = req.query.guild_id;
    try {
        const code = req.query.code;
        if (!code) throw new Error('Código de autorização ausente');

        const validCode = /^[a-zA-Z0-9-_]+$/;
        if (!validCode.test(String(code))) throw new Error('Código de autorização inválido');

        const oauthResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            // @ts-ignore
            body: new URLSearchParams({
                client_id: config.oauth.clientId,
                client_secret: process.env.CLIENT_SECRET,
                code,
                grant_type: 'authorization_code',
                redirect_uri: config.oauth.callbackURL,
                scope: config.oauth.scopes.join(' '),
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        const oauthData: any = await oauthResponse.json();
        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: { authorization: `${oauthData.token_type} ${oauthData.access_token}` },
        });

        const user: User = await userResponse.json() as User;
        const userData = await database.getUser(user.id);

        req.session.user_info = {
            id: user.id,
            username: user.username,
            global_name: user.global_name,
            avatar: user.avatar,
        };
        req.session.bearer_token = oauthData.access_token;
        req.session.oauth_type = oauthData.token_type;
        req.session.db_info = userData;
        req.session.save();

        logger.log(`[LOGIN] Usuário ${user.username} / ${user.id} fez login no website!`);

        if (guildId) {
            const guildName = (await rest.getGuild(String(guildId))).name;
            await sendWelcomeMessage(user.id, guildName);
            return res.redirect(constants.SERVER_SETTINGS(String(guildId)));
        }

        res.redirect(constants.DASHBOARD);
    } catch (err) {
        logger.error(err);
        res.redirect('/error');
    }
});

router.get('/login', (req, res) => {
    res.redirect(`https://discord.com/api/oauth2/authorize` +
        `?client_id=${config.oauth.clientId}` +
        `&redirect_uri=${encodeURIComponent(config.oauth.callbackURL)}` +
        `&response_type=code&scope=${encodeURIComponent(config.oauth.scopes.join(" "))}`);
});

router.get('/logout', (req, res) => {
    if (!req.session.bearer_token) {
        res.redirect('/');
    } else {
        req.session.destroy(err => {
            if (err) {
                logger.error('Erro ao destruir sessão:', err);
            }
            res.redirect('/');
        });
    }
});

module.exports = router;