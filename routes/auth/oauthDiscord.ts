import express from 'express';
import fetch from 'node-fetch-commonjs';
import config from '../../config.json';
import user from '../../database/mongoConnect.js';

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
            const userData = await user.findOne({ _id: await result.id });

            if (!userData) {
                new user({
                    _id: await result.id,
                    userCreationTimestamp: Date.now(),
                    premium: false,
                    premiumDate: null,
                    isBanned: false,
                    banData: null,
                    banReason: null,
                    aboutme: null,
                    balance: 0,
                    lastDaily: null,
                    marriedWith: null,
                    repCount: 0,
                    lastRep: null,
                    background: "default",
                    backgrounds: ["default"],
                    language: "pt-BR",
                    premiumType: null,
                    mask: null,
                    masks: [],
                    layout: "default"
                }).save().catch(err => console.log(err));

                console.log(`[MONGO] Usuário: ${result.username} foi salvo no banco de dados!`);
            }

            req.session.user_info = result;
            req.session.bearer_token = oauthData.access_token;
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