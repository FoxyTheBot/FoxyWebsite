const express = require('express');
const router = express.Router();
const config = require('../../config.json');

router.use(require("express-session")(config.session));

router.get("/", (req, res) => {
    if (!req.session.bearer_token) {
        res.status(200).render("../pages/logged-off/index.ejs");
    } else {
        res.status(200).render("../pages/logged/index.ejs", {
            user: req.session.user_info,
        });
    }
})

router.get("/privacy", (req, res) => {
    if (!req.session.bearer_token) {
        res.status(200).render("../pages/logged-off/privacy.ejs");
    } else {
        res.status(200).render("../pages/logged/privacy.ejs", {
            user: req.session.user_info,
            db: req.session.db_info,
        });
    }
})

router.get("/dashboard", (req, res) => {
    if (!req.session.bearer_token) {
        res.redirect('/login');
    } else {
        res.status(200).render("../pages/logged/dashboard.ejs", {
            user: req.session.user_info,
            db: req.session.db_info,
        });
    }
});

router.get('/team', (req, res) => {
    if (!req.session.bearer_token) {
        res.status(200).render("../pages/logged-off/team.ejs");
    } else {
        res.status(200).render("../pages/logged/team.ejs", {
            user: req.session.user_info,
            db: req.session.db_info,
        });
    }
})

router.get('/del', (req, res) => {
    if (!req.session.bearer_token) {
        res.redirect('/login');
    } else {
        res.status(200).render("../pages/logged/del.ejs", {
            user: req.session.user_info,
            db: req.session.db_info,
        });
    }
})

router.get('/commands', (req, res) => {
    if (!req.session.bearer_token) {
        res.status(200).render("../pages/logged-off/commands.ejs");
    } else {
        res.status(200).render("../pages/logged/commands.ejs", {
            user: req.session.user_info,
            db: req.session.db_info,
        });
    }
});

router.get('/error', (req, res) => {
    if (!req.session.bearer_token) {
        res.status(200).render("../pages/logged-off/error.ejs", {
            error: req.query.error,
        });
    } else {
        res.status(200).render("../pages/logged/error.ejs", {
            user: req.session.user_info,
            error: req.query.error,
        });
    }
});

router.get('/404', (req, res) => {
    if (!req.session.bearer_token) {
        res.status(200).render("../pages/logged-off/404.ejs")
    } else {
        res.status(200).render("../pages/logged-on/404.ejs", {
            user: req.session.user_info
        });
    }
});

module.exports = router;