import * as express from 'express';
const router = express.Router();
const config = require('../../config.json');
const user = require('../../database/mongoConnect');
const key = require('../../database/keyModel');

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

router.get("/premium", (req, res) => {
    if (!req.session.bearer_token) {
        res.redirect("/login");
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
        userData.save();
        return res.send("<script>alert('Premium activated');window.location.href='/dashboard';</script>");
    }
});

router.get("/privacy", (req, res) => {
    if (!req.session.bearer_token) {
        res.status(200).render("../public/pages/logged-off/privacy.ejs");
    } else {
        res.status(200).render("../public/pages/logged/privacy.ejs");
    }
});

router.get("/radio", (req, res) => {
    if (!req.session.bearer_token) {
        res.status(200).render("../public/pages/logged-off/radio.ejs");
    } else {
        res.status(200).render("../public/pages/logged/radio.ejs");
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

        if (userBanned) {
            res.status(401).render("../public/pages/logged/banned.ejs");
        }

        res.status(200).render("../public/pages/logged/dashboard.ejs", {
            user: req.session.user_info,
            db: userData,
            aboutme: aboutMe,
            premium: premium
        });
    }
});

router.get('/daily', async (req, res) => {
    if (!req.session.bearer_token) {
        res.redirect('/login');
    } else {
        const userId = req.session.user_info.id;
        var userData = await user.findOne({ _id: userId });
        const timeout = 43200000;

        var amount = Math.floor(Math.random() * 3200);

        if (userData.premium) {
            amount = amount + 4628;
        }

        const daily = await userData.lastDaily;
        if (daily !== null && timeout - (Date.now() - daily) > 0) {

            return res.status(200).render("../public/pages/logged/dailyTime.ejs", {
                user: req.session.user_info,
                db: req.session.db_info,
            });

        } else {

            userData.balance += amount;
            userData.lastDaily = Date.now();
            userData.save().catch(err => console.log(err));

            req.session.coins = amount;
            req.session.dbCoins = userData.balance;
            res.status(200).render("../public/pages/logged/daily.ejs", {
                user: req.session.user_info,
                coins: req.session.coins,
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
        res.status(200).render("../public/pages/logged/team.ejs");
    }
});

router.get('/commands', (req, res) => {
    if (!req.session.bearer_token) {
        res.status(200).render("../public/pages/logged-off/commands.ejs");
    } else {
        res.status(200).render("../public/pages/logged/commands.ejs");
    }
});

router.get('/error', (req, res) => {
    if (!req.session.bearer_token) {
        res.status(200).render("../public/pages/logged-off/error.ejs");
    } else {
        res.status(200).render("../public/pages/logged/error.ejs");
    }
});

router.get('/404', (req, res) => {
    if (!req.session.bearer_token) {
        res.status(200).render("../public/pages/logged-off/404.ejs");
    } else {
        res.status(200).render("../public/pages/logged/404.ejs");
    }
});

module.exports = router;