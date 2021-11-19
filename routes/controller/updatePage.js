const express = require('express');
const router = express.Router();
const config = require('../../config.json');
const user = require('../../database/mongoConnect');

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

router.get("/privacy", (req, res) => {
    if (!req.session.bearer_token) {
        res.status(200).render("../public/pages/logged-off/privacy.ejs");
    } else {
        res.status(200).render("../public/pages/logged/privacy.ejs");
    }
});

router.get("/dashboard", async (req, res) => {
    if (!req.session.bearer_token) {
        res.redirect('/login');
    } else {
        const userId = req.session.user_info.id;

        const userData = await user.findOne({ _id: userId });
        var aboutMe = await userData.aboutme;
        var premium = await userData.premium;
        const userBanned = await userData.isBanned;

        if (premium) {
            premium = "🔑";
        } else {
            premium = null;
        }

        if (userBanned) {
            res.status(401).render("../public/pages/logged/banned.ejs");
        }

        if (!aboutMe) aboutMe = "Você não possui um sobre mim definido!";
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
        res.status(200).render("../public/pages/logged-on/404.ejs");
    }
});

module.exports = router;