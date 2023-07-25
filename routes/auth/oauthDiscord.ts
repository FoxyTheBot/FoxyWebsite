import express from 'express';
import fetch from 'node-fetch-commonjs';
import config from '../../config.json';
import { database } from '../../client/app';

const router = express.Router();

router.get('/login/callback', async (req, res) => {
    const code = await req.query.code;
    if (code) {
        try {
            const oauth: any = await fetch(`https://discord.com/api/oauth2/token`, {
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
            const userData: any = await database.getUser(await result.id);
           
            req.session.user_info = result;
            req.session.bearer_token = oauthData.access_token;
            req.session.oauth_type = oauthData.token_type;
            req.session.db_info = userData;
            console.log(`[LOGIN] Usuário ${result.username} / ${result.id} fez login no website!`);
        } catch (err) {
            console.log(err);
            res.redirect('/error');
        }
    }

    res.redirect('/');
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
})


module.exports = router;