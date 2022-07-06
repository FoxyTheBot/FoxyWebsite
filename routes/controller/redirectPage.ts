import * as express from 'express';
const router = express.Router();

router.get('/add', (req, res) => {
    res.redirect('https://discord.com/oauth2/authorize?client_id=737044809650274325&scope=bot+applications.commands&permissions=269872255');
});

router.get('/github', (req, res) => {
    res.redirect('https://github.com/FoxyTheBot/Foxy');
});

router.get('/discord', (req, res) => {
    res.redirect('https://discord.gg/Tj6AMkbXbA');
});

router.get('/support', (req, res) => {
    res.redirect('https://discord.gg/Tj6AMkbXbA');
});

router.get('/donate', (req, res) => {
    res.redirect('https://ko-fi.com/wing4merbr');
});

router.get('/upvote', (req, res) => {
    res.redirect('https://top.gg/bot/737044809650274325');
});
export = router; 