import express from 'express';
import fetch from 'node-fetch-commonjs';
import config from '../../config.json';
import { database } from '../../client/app';
import session from 'express-session';
import { logger } from '../../structures/logger';

const router = express.Router();

router.use(session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_TOKEN,
    cookie: {
        maxAge: config.session.cookie.maxAge,
        httpOnly: true,
        sameSite: 'strict',
    }
}));

router.get('/login/callback', async (req, res) => {
    try {
        const code = req.query.code;
        if (!code) {
            throw new Error('Código de autorização ausente');
        }
        
        const validCode = /^[a-zA-Z0-9-_]+$/;
        // @ts-ignore
        if (!validCode.test(code)) {
            throw new Error('Código de autorização inválido');
        }

        const oauth = await fetch(`https://discord.com/api/oauth2/token`, {
            method: 'POST',
            // @ts-ignore
            body: new URLSearchParams({
                client_id: config.oauth.clientId,
                client_secret: process.env.CLIENT_SECRET,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: config.oauth.callbackURL,
                scope: config.oauth.scopes,
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
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
            id: escape(result.id),
            username: escape(result.username),
            global_name: escape(result.global_name),
            avatar: escape(result.avatar),
        };
        req.session.bearer_token = escape(oauthData.access_token);
        req.session.oauth_type = escape(oauthData.token_type);
        req.session.db_info = escape(userData);

        logger.log(`[LOGIN] Usuário ${escape(result.username)} / ${escape(result.id)} fez login no website!`);
        
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
        req.session.destroy();
        res.redirect('/');
    }
});

module.exports = router;