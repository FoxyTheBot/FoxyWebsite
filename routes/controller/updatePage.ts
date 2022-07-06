import { MessageAttachment } from 'discord.js';
import * as express from 'express';
const router = express.Router();
const config = require('../../config.json');
const user = require('../../database/mongoConnect');
const key = require('../../database/keyModel');
const DiscordHook = require('../../client/WebhookManager.js');
const upload = require('../../middlewares/uploadImage.js');
const Resize = require('../../middlewares/Resize.js');
const path = require('path');

router.use(require("express-session")(config.session));

router.get("/", (req, res) => {
    if (!req.session.bearer_token) {
        res.status(200).render("../public/pages/logged-off/index.ejs");
    } else {
        res.status(200).render("../public/pages/logged/index.ejs", {
            user: req.session.user_info,
        });
    }
});

router.get("/premium", async (req, res) => {
    const userData = await user.findOne({ _id: req.session.user_info.id });
    if (!req.session.bearer_token) {
        res.redirect("/login");
    } else if (await userData.premium) {
        res.send("<script>alert('Você não está qualificado para este recurso');window.location.href='/dashboard'</script>");
    } else {
        res.status(200).render("../public/pages/logged/premium.ejs", {
            user: req.session.user_info,
        });
    }
});

router.post("/activate", async (req, res) => {
    if (!req.session.bearer_token) {
        res.redirect("/login");
    } else {
        const userData = await user.findOne({ _id: req.session.user_info.id });
        const keyData = await key.findOne({ key: req.body.key });

        if (!keyData) return res.send("<script>alert('Invalid key');window.location.href='/premium';</script>");
        if (keyData.activated) return res.send("<script>alert('Key already activated');window.location.href='/dashboard';</script>");
        if (keyData._id !== userData._id) return res.send("<script>alert('This key is not yours');</script>");
        if (userData.premium) return res.send("<script>alert('You already have premium');</script>");

        userData.premium = true;
        userData.premiumDate = new Date();
        userData.premiumType = "INFINITY_PRO";
        userData.save();
        return res.send("<script>alert('Premium activated');window.location.href='/dashboard';</script>");
    }
});

router.get('/background', async (req, res) => {
    if (!req.session.bearer_token) {
        res.redirect("/login");
    } else {
        const userData = await user.findOne({ _id: req.session.user_info.id });
        if (await userData.premium && userData.premiumType === "VETERAN" || userData.premiumType === "INFINITY_PRO" || userData.premiumType === "INFINITY_TURBO") {
            res.status(200).render("../public/pages/logged/background.ejs", {
                user: req.session.user_info,
            });
        } else {
            return res.send("<script>alert('Você não está qualificado para este recurso');window.location.href='/dashboard';</script>");
        }
    }
});

router.get("/about", (req, res) => {
    if (!req.session.bearer_token) {
        res.status(200).render("../public/pages/logged-off/about.ejs");
    } else {
        res.status(200).render("../public/pages/logged/about.ejs", {
            user: req.session.user_info,
        });
    }
});
router.post('/upload', upload.single('image'), async (req, res) => {
    if (!req.session.bearer_token) {
        res.redirect("/login");
    } else {
        const userData = await user.findOne({ _id: req.session.user_info.id });
        console.log(await userData.premiumType === "VETERAN" || userData.premiumType === "INFINITY_PRO" || userData.premiumType === "INFINITY_TURBO")
        if (await userData.premiumType === "VETERAN" || userData.premiumType === "INFINITY_PRO" || userData.premiumType === "INFINITY_TURBO") {

        }
    }
});
router.get("/privacy", (req, res) => {
    if (!req.session.bearer_token) {
        res.status(200).render("../public/pages/logged-off/privacy.ejs");
    } else {
        res.status(200).render("../public/pages/logged/privacy.ejs", {
            user: req.session.user_info,
        });
    }
});

router.get("/radio", (req, res) => {
    if (!req.session.bearer_token) {
        res.status(200).render("../public/pages/logged-off/radio.ejs");
    } else {
        res.status(200).render("../public/pages/logged/radio.ejs", {
            user: req.session.user_info
        });
    }
});

router.get("/dashboard", async (req, res) => {
    if (!req.session.bearer_token) {
        res.redirect('/login');
    } else {
        const userId: String = req.session.user_info.id;

        const userData = await user.findOne({ _id: userId });
        var aboutMe: String = await userData.aboutme;
        var premium: String = await userData.premium;
        const timeout = 43200000;
        const daily = await userData.lastDaily;
        const userBanned: Boolean = await userData.isBanned;
        if (!aboutMe) aboutMe = "Você não possui um sobre mim definido!";

        if (aboutMe.length > 60) {
            const aboutme = aboutMe.match(/.{1,60}/g);
            aboutMe = aboutme.join("\n");
        }

        if (premium) {
            premium = "🔑";
        } else {
            premium = null;
        }

        var type;

        if (await userData.premiumType) {
            switch (await userData.premiumType) {
                case "INFINITY_PRO": {
                    type = "Foxy Infinity Pro";
                    break;
                }
                case "INFINITY_ESSENTIALS": {
                    type = "Foxy Infinity Essentials";
                    break;
                }
                case "INFINITY_TURBO": {
                    type = "Foxy Infinity Turbo";
                    break;
                }
                case "VETERAN": {
                    type = "Foxy Veteran";
                    break;
                }
            }
        }
        if (userBanned) {
            res.status(401).render("../public/pages/logged/banned.ejs");
        }

        if (daily !== null && timeout - (Date.now() - daily) > 0) {
            return res.status(200).render("../public/pages/logged/dashboard.ejs", {
                allowed: false,
                user: req.session.user_info,
                db: userData,
                aboutme: aboutMe,
                premium: premium,
                type: type,
                agent: req.useragent.source
            });
        } else {
            res.status(200).render("../public/pages/logged/dashboard.ejs", {
                allowed: true,
                user: req.session.user_info,
                db: userData,
                aboutme: aboutMe,
                premium: premium,
                type: type,
                agent: req.useragent.source
            });
        }
    }
});

router.get('/daily', async (req, res) => {
    if (!req.session.bearer_token) {
        res.redirect('/login');
    } else {
        const userId = req.session.user_info.id;
        const userData = await user.findOne({ _id: userId });

        let amount = Math.floor(Math.random() * 8000);
        amount = Math.round(amount / 10) * 10;

        const timeout = 43200000;
        const daily = await userData.lastDaily;

        if (daily !== null && timeout - (Date.now() - daily) > 0) {
            return res.redirect("/dashboard");
        } else {

            var h1 = "Você resgatou o seu prêmio diário e...";
            var h3;
            var img = "../assets/images/foxyoculos.png";
            if (await userData.premiumType) {
                switch (await userData.premiumType) {
                    case "INFINITY_PRO": {
                        h1 = `Você resgatou o seu prêmio diário e como você é assinante do Infinity Pro, seu daily foi multiplicado por 1.5x`;
                        amount = amount * 1.5;
                        break;
                    }
                    case "INFINITY_ESSENTIALS": {
                        h1 = `Você resgatou o seu prêmio diário e como você é assinante do Infinity Essentials, seu daily foi multiplicado por 1.25x`;
                        amount = amount * 1.25;
                        break;
                    }
                    case "INFINITY_TURBO": {
                        h1 = `Você resgatou o seu prêmio diário e como você é assinante do Infinity Turbo, seu daily foi multiplicado por 2x`;
                        amount = amount * 2;
                        break;
                    }
                    case "VETERAN": {
                        h1 = `Você é um veterano do Foxy Premium, e recebeu 2x de daily é isso :3`;
                        h3 = "Digamos que você é uma raridade, o Foxy Veteran é um plano para pessoas que pegaram o premium antes do surgimento dos planos Foxy Infinity... E poucas pessoas puderam isso"
                        amount = amount * 2;
                        img = "../assets/emojis/foxylick.gif"
                        break;
                    }
                }
            }

            userData.balance += amount;
            userData.lastDaily = Date.now();
            userData.save().catch(err => console.log(err));

            req.session.coins = amount;
            req.session.dbCoins = userData.balance;
            res.status(200).render("../public/pages/logged/daily.ejs", {
                user: req.session.user_info,
                coins: req.session.coins,
                h1: h1,
                h3: h3,
                img: img,
                dbCoins: req.session.dbCoins
            });
        }
    }
});

router.get('/delete', async (req, res) => {
    if (!req.session.bearer_token) {
        res.redirect('/login');
    } else {
        const userId = req.session.user_info.id;
        const userData = await user.findOne({ _id: userId });
        const marriedData = await user.findOne({ marriedWith: userId });

        marriedData.marriedWith = null;
        marriedData.save()
        userData.remove().catch(err => console.log(err));
        req.session.destroy();
        return res.status(200).render("../public/pages/logged-off/deletedUser.ejs");
    }
});

router.get('/confirm', async (req, res) => {
    if (!req.session.bearer_token) {
        res.redirect('/login');
    } else {
        const userId = req.session.user_info.id;
        const userData = await user.findOne({ _id: userId });
        res.status(200).render("../public/pages/logged/confirm.ejs", {
            user: req.session.user_info,
            db: userData
        });
    }
});

router.get("/aboutme", async (req, res) => {
    if (!req.session.bearer_token) {
        res.redirect('/login');
    } else {
        const userId = req.session.user_info.id;
        const userData = await user.findOne({ _id: userId });

        res.status(200).render("../public/pages/logged/aboutMe.ejs", {
            user: req.session.user_info,
            db: userData
        })
    }
});

router.post("/submit", async (req, res) => {
    if (!req.session.bearer_token) {
        res.redirect('/login');
    } else {
        const userData = await user.findOne({ _id: req.session.user_info.id });
        userData.aboutme = req.body.aboutme;
        userData.save().catch(err => console.log(err));
        return res.redirect('/dashboard');
    }
})
router.get('/team', (req, res) => {
    if (!req.session.bearer_token) {
        res.status(200).render("../public/pages/logged-off/team.ejs");
    } else {
        res.status(200).render("../public/pages/logged/team.ejs", {
            user: req.session.user_info
        });
    }
});

router.get('/commands', (req, res) => {
    if (!req.session.bearer_token) {
        res.status(200).render("../public/pages/logged-off/commands.ejs");
    } else {
        res.status(200).render("../public/pages/logged/commands.ejs", {
            user: req.session.user_info
        });
    }
});

router.get('/error', (req, res) => {
    if (!req.session.bearer_token) {
        res.status(200).render("../public/pages/logged-off/error.ejs");
    } else {
        res.status(200).render("../public/pages/logged/error.ejs", {
            user: req.session.user_info
        });
    }
});

router.get('/404', (req, res) => {
    if (!req.session.bearer_token) {
        res.status(200).render("../public/pages/logged-off/404.ejs");
    } else {
        res.status(200).render("../public/pages/logged/404.ejs", {
            user: req.session.user_info
        });
    }
});

module.exports = router;