const express = require('express');
const router = express.Router();
const config = require('../../config.json');
const user = require('../../database/mongoConnect');


router.use(require("express-session")(config.session));

router.get("/", (req, res) => {
    if (!req.session.bearer_token) {
        res.status(200).render("../pages/logged-off/index.ejs");
    } else {
        res.status(200).render("../pages/logged/index.ejs", {
            user: req.session.user_info,
        });
    }
});

router.get("/privacy", (req, res) => {
    if (!req.session.bearer_token) {
        res.status(200).render("../pages/logged-off/privacy.ejs");
    } else {
        res.status(200).render("../pages/logged/privacy.ejs");
    }
});

router.get("/dashboard", async (req, res) => {
    if (!req.session.bearer_token) {
        res.redirect('/login');
    } else {
        const userId = req.session.user_info.id;

        const userData = await user.findOne({ _id: userId });
        var aboutMe = await userData.aboutme;

        if (!aboutMe) aboutMe = "Você não possui um sobre mim definido!";
        res.status(200).render("../pages/logged/dashboard.ejs", {
            user: req.session.user_info,
            db: userData,
            aboutme: aboutMe
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
            amount = amount * 4200;
        }

        const daily = await userData.lastDaily;
        if (daily !== null && timeout - (Date.now() - daily) > 0) {

            return res.status(200).render("../pages/logged/dailyTime.ejs", {
                user: req.session.user_info,
                db: req.session.db_info,
            });

        } else {

            userData.balance += amount;
            userData.lastDaily = Date.now();
            userData.save().catch(err => console.log(err));

            req.session.coins = amount;
            req.session.dbCoins = userData.balance;
            res.status(200).render("../pages/logged/daily.ejs", {
                user: req.session.user_info,
                coins: req.session.coins,
                dbCoins: req.session.dbCoins,
            });
        }
    }
});

router.get('/team', (req, res) => {
    if (!req.session.bearer_token) {
        res.status(200).render("../pages/logged-off/team.ejs");
    } else {
        res.status(200).render("../pages/logged/team.ejs");
    }
});

router.get('/commands', (req, res) => {
    if (!req.session.bearer_token) {
        res.status(200).render("../pages/logged-off/commands.ejs");
    } else {
        res.status(200).render("../pages/logged/commands.ejs");
    }
});

router.get('/error', (req, res) => {
    if (!req.session.bearer_token) {
        res.status(200).render("../pages/logged-off/error.ejs");
    } else {
        res.status(200).render("../pages/logged/error.ejs");
    }
});

router.get('/404', (req, res) => {
    if (!req.session.bearer_token) {
        res.status(200).render("../pages/logged-off/404.ejs");
    } else {
        res.status(200).render("../pages/logged-on/404.ejs");
    }
});

module.exports = router;