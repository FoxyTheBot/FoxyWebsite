import * as express from 'express';
import { constants } from '../../structures/constants';
const router = express.Router();

router.get('/add', (_, res) => {
    res.redirect(constants.DISCORD_OAUTH_URL);
});

router.get('/github', (_, res) => {
    res.redirect(constants.GITHUB_URL);
});

router.get("/exitlag", (_, res) => {
    res.redirect(constants.EXITLAG_URL);
});

router.get('/discord', (_, res) => {
    res.redirect(constants.DISCORD_SERVER_URL);
});

router.get('/privacy', (_, res) => {
    res.redirect(constants.PRIVACY_POLICY_URL);    
});

router.get("/translate", (_, res) => {
    res.redirect(constants.TRANSLATE_URL);
});

router.get("/status", (_, res) => {
    res.redirect(constants.STATUS_PAGE_URL);
});

router.get('/upvote', (_, res) => {
    res.redirect(constants.UPVOTE_URL);
});

router.get("/ads.txt", (_, res) => {
    res.sendFile("ads.txt", { root: "./public" });
});

router.get("/sitemap.xml", (_, res) => {
    res.sendFile("sitemap.xml", { root: "./public" });
});

export = router; 