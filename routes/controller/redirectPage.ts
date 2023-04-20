import * as express from 'express';
const router = express.Router();

router.get('/add', (req, res) => {
    res.redirect('https://discord.com/oauth2/authorize?client_id=1006520438865801296&scope=bot+applications.commands&permissions=269872255');
});

router.get('/github', (req, res) => {
    res.redirect('https://github.com/FoxyTheBot/Foxy');
});

router.get('/discord', (req, res) => {
    res.redirect('https://discord.gg/6mG2xDtuZD');
});

router.get('/support', (req, res) => {
    res.redirect('https://discord.gg/6mG2xDtuZD');
});

router.get("/translate", (req, res) => {
    res.redirect("https://translate.foxybot.win");
});

router.get('/upvote', (req, res) => {
    res.redirect('https://top.gg/bot/1006520438865801296');
});
export = router; 