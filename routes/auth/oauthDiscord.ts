import express from 'express';
import fetch from 'node-fetch-commonjs';
import config from '../../config.json';
import { database } from '../../client/app';
import { logger } from '../../structures/logger';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

router.get('/login/callback', async (req, res) => {
    try {
        const code = req.query.code;
        if (!code) {
            throw new Error('Código de autorização ausente');
        }

        const validCode = /^[a-zA-Z0-9-_]+$/;
        if (!validCode.test(String(code))) {
            throw new Error('Código de autorização inválido');
        }

        const oauth = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            // @ts-ignore
            body: new URLSearchParams({
                client_id: config.oauth.clientId,
                client_secret: process.env.CLIENT_SECRET,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: config.oauth.callbackURL,
                scope: config.oauth.scopes.join(' '),
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const oauthData: any = await oauth.json();
        const userResult = await fetch('https://discord.com/api/users/@me', {
            headers: {
                authorization: `${oauthData.token_type} ${oauthData.access_token}`,
            },
        });

        const result: any = await userResult.json();
        const userData = await database.getUser(result.id);

        req.session.user_info = {
            id: result.id,
            username: result.username,
            global_name: result.global_name,
            avatar: result.avatar,
        };
        req.session.bearer_token = oauthData.access_token;
        req.session.oauth_type = oauthData.token_type;
        req.session.db_info = userData;
        req.session.save();
        
        logger.log(`[LOGIN] Usuário ${result.username} / ${result.id} fez login no website!`);
        res.redirect('/');
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