import * as express from 'express';
const router = express.Router();

router.get('/add', (req, res) => {
    res.redirect('https://discord.com/oauth2/authorize?client_id=1006520438865801296&permissions=269872255&response_type=code&redirect_uri=https%3A%2F%2Ffoxybot.win%2Flogin%2Fcallback&integration_type=0&scope=guilds+bot+applications.commands+email+identify');
});

router.get('/github', (req, res) => {
    res.redirect('https://github.com/FoxyTheBot/Foxy');
});

router.get('/discord', (req, res) => {
    res.redirect('https://discord.gg/6mG2xDtuZD');
});

router.get('/privacy', (req, res) => {
    res.redirect('https://foxybot.win/br/support/terms');    
});

router.get("/translate", (req, res) => {
    res.redirect("https://translate.foxybot.win");
});

router.get("/status", (req, res) => {
    res.redirect("https://foxybot.statuspage.io/");
});

router.get('/upvote', (req, res) => {
    res.redirect('https://top.gg/bot/1006520438865801296');
});

router.get("/ads.txt", (req, res) => {
    res.sendFile("ads.txt", { root: "./public" });
});

export = router; 