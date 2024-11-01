import * as express from 'express';
import { constants } from '../../structures/constants';
const router = express.Router();

router.get('/add', (req, res) => {
    res.redirect(constants.DISCORD_OAUTH_URL);
});

router.get('/github', (req, res) => {
    res.redirect(constants.GITHUB_URL);
});

router.get('/discord', (req, res) => {
    res.redirect(constants.DISCORD_SERVER_URL);
});

router.get('/privacy', (req, res) => {
    res.redirect(constants.PRIVACY_POLICY_URL);    
});

router.get("/translate", (req, res) => {
    res.redirect(constants.TRANSLATE_URL);
});

router.get("/status", (req, res) => {
    res.redirect(constants.STATUS_PAGE_URL);
});

router.get('/upvote', (req, res) => {
    res.redirect(constants.UPVOTE_URL);
});

router.get("/ads.txt", (req, res) => {
    res.sendFile("ads.txt", { root: "./public" });
});

export = router; 