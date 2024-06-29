import express from 'express';
import config from '../../config.json';
import { database } from '../../client/app';
import { GuildResponse } from '../../types/guildResponse';
import { logger } from '../../structures/logger';

const router = express.Router();

const checkSession = (req, res, next) => {
    if (!req.session.bearer_token) {
        req.session.user_info = null;
    }
    next();
};

const renderPage = (page, options = {}) => (req, res) => {
    res.status(200).render(page, {
        user: req.session.user_info,
        ...options
    });
};

const isAuthenticated = (req, res, next) => {
    if (!req.session.bearer_token) {
        return res.redirect('/login');
    }
    next();
};

const errorHandler = (err, req, res, next) => {
    console.error(err);
    res.status(500).send("Internal Server Error");
};

router.use(checkSession);

router.get("/", renderPage("../public/pages/index.ejs"));

router.get("/:lang/support/guidelines", renderPage("../public/pages/info/guidelines.ejs"));

router.get('/:lang/premium', renderPage("../public/pages/info/premium.ejs"));

router.get("/:lang/support/terms", renderPage("../public/pages/info/privacy.ejs"));

router.get("/:lang/store", isAuthenticated, async (req, res, next) => {
    try {
        const userData = await database.getUser(req.session.user_info.id);
        const backgrounds = await database.getAllBackgrounds();
        res.status(200).render("../public/pages/dashboard/user/store/background.ejs", {
            user: req.session.user_info,
            userBackgrounds: userData.userProfile.backgroundList,
            storeContent: {
                backgrounds: backgrounds
            }
        });
    } catch (error) {
        next(error);
    }
});

// Soon

router.get("/:lang/store/layouts", isAuthenticated, async (req, res, next) => {
    res.status(200).send("Soon");
});

router.get("/:lang/store/decorations", isAuthenticated, async (req, res, next) => {
    try {
        const userData = await database.getUser(req.session.user_info.id);
        const decorations = await database.getAllDecorations();

        res.status(200).render("../public/pages/dashboard/user/store/decoration.ejs", {
            user: req.session.user_info,
            userDecorations: userData.userProfile.decorationList,
            storeContent: {
                decorations: decorations
            }
        });
    } catch (error) {
        next(error);
    }
});

router.get("/:lang/rso/login", (req, res) => {
    const data = {
        puuid: req.query.puuid,
        gameName: req.query.gameName,
        tagLine: req.query.tagLine,
        authCode: req.query.key
    };

    res.status(200).render("../public/pages/utils/rso.ejs", {
        user: null,
        body: data
    });
});

router.post("/:lang/store/decorations/confirm/:id", isAuthenticated, async (req, res, next) => {
    try {
        const userId = req.session.user_info.id;
        const userData = await database.getUser(userId);
        const decoration = await database.getDecoration(req.params.id);
        if (!decoration) {
            return res.status(404).send("<script>alert('Esta decoração não existe'); window.location.href = '/br/store';</script>")
        }

        if (userData.userCakes.balance < decoration.cakes) {
            return res.status(200).send("<script>alert('Você não tem cakes suficientes para comprar esta decoração'); window.location.href = '/br/store';</script>");
        }

        if (userData.userProfile.decorationList.includes(decoration.id)) {
            return res.status(200).send("<script>alert('Você já possui esta decoração'); window.location.href = '/br/store';</script>");
        }

        userData.userProfile.decoration = decoration.id;
        userData.userProfile.decorationList.push(decoration.id);
        userData.userCakes.balance -= decoration.cakes;
        userData.userTransactions.push({
            to: config.oauth.clientId,
            from: req.session.user_info.id,
            quantity: Number(decoration.cakes),
            date: new Date(Date.now()),
            received: false,
            type: 'store'
        });
        userData.save().catch(err => logger.log(err));
        return res.redirect("/br/store");
    } catch (error) {
        next(error);
    }
});

router.post("/:lang/store/confirm/:id", isAuthenticated, async (req, res, next) => {
    try {
        const userId = req.session.user_info.id;
        const userData = await database.getUser(userId);
        const background = await database.getBackground(req.params.id);
        if (!background) {
            return res.status(404).send("<script>alert('este item não existe'); window.location.href = '/br/store';</script>")
        }

        if (userData.userCakes.balance < background.cakes) {
            return res.status(200).send("<script>alert('Você não tem cakes suficientes para comprar este item'); window.location.href = '/br/store';</script>");
        }

        if (userData.userProfile.backgroundList.includes(background.id)) {
            return res.status(200).send("<script>alert('Você já possui este item'); window.location.href = '/br/store';</script>");
        }

        userData.userProfile.background = background.id;
        userData.userProfile.backgroundList.push(background.id);
        userData.userCakes.balance -= background.cakes;
        userData.userTransactions.push({
            to: config.oauth.clientId,
            from: req.session.user_info.id,
            quantity: Number(background.cakes),
            date: new Date(Date.now()),
            received: false,
            type: 'store'
        });
        userData.save().catch(err => logger.log(err));
        return res.redirect("/br/store");
    } catch (error) {
        next(error);
    }
});

router.get("/:lang/background/change/:id", isAuthenticated, async (req, res, next) => {
    try {
        const userId = req.session.user_info.id;
        const userData = await database.getUser(userId);
        const background = await database.getBackground(req.params.id);
        if (!background) {
            return res.status(404).send("<script>alert('este item não existe'); window.location.href = '/br/store';</script>")
        }

        if (!userData.userProfile.backgroundList.includes(background.id)) {
            return res.status(200).send("<script>alert('Você não possui este item'); window.location.href = '/br/store';</script>");
        }

        userData.userProfile.background = background.id;
        userData.save().catch(err => logger.log(err));
        return res.redirect("/br/dashboard");
    } catch (error) {
        next(error);
    }
});

router.get("/:lang/decorations/change/:id", isAuthenticated, async (req, res, next) => {
    try {
        const userId = req.session.user_info.id;
        const userData = await database.getUser(userId);
        const decoration = await database.getDecoration(req.params.id);
        if (!decoration) {
            return res.status(404).send("<script>alert('Esta decoração não existe'); window.location.href = '/br/store';</script>")
        }

        if (!userData.userProfile.decorationList.includes(decoration.id)) {
            return res.status(200).send("<script>alert('Você não possui esta decoração'); window.location.href = '/br/store';</script>");
        }

        userData.userProfile.decoration = decoration.id;
        userData.save().catch(err => logger.log(err));
        return res.redirect("/br/user/decorations");
    } catch (error) {
        next(error);
    }
});

router.get("/:lang/dashboard", isAuthenticated, async (req, res, next) => {
    try {
        const userId = req.session.user_info.id;
        const userData = await database.getUser(userId);
        const backgrounds = await database.getAllBackgrounds();
        const userBackgrounds = [];
        for (let i = 0; i < userData.userProfile.backgroundList.length; i++) {
            const background = await database.getBackground(userData.userProfile.backgroundList[i]);
            userBackgrounds.push(background);
        }

        res.status(200).render("../public/pages/dashboard/user/backgrounds.ejs", {
            user: req.session.user_info,
            userBackgrounds: userBackgrounds,
            currentBackground: userData.userProfile.background,
            storeContent: {
                backgrounds: backgrounds
            }
        });
    } catch (error) {
        next(error);
    }
});

router.get("/:lang/user/decorations", isAuthenticated, async (req, res, next) => {
    try {
        const userId = req.session.user_info.id;
        const userData = await database.getUser(userId);
        const decorations = await database.getAllDecorations();
        const userDecorations = [];
        for (let i = 0; i < userData.userProfile.decorationList.length; i++) {
            const decoration = await database.getDecoration(userData.userProfile.decorationList[i]);
            userDecorations.push(decoration);
        }

        res.status(200).render("../public/pages/dashboard/user/decorations.ejs", {
            user: req.session.user_info,
            userDecorations: userDecorations,
            currentDecoration: userData.userProfile.decoration,
            storeContent: {
                decorations: decorations
            }
        });
    } catch (error) {
        next(error);
    }
});

const prizes = [
    { prize: 1000000, weight: 1 },
    { prize: 100000, weight: 10 },
    { prize: 10000, weight: 20 },
    { prize: 1000, weight: 50 },
    { prize: 500, weight: 100 },
    { prize: 250, weight: 150 },
]

function getRandomPrize(prizes) {
    const totalWeight = prizes.reduce((acc, prize) => acc + prize.weight, 0);
    const random = Math.random() * totalWeight;
    let currentWeight = 0;

    for (const prize of prizes) {
        currentWeight += prize.weight;
        if (random < currentWeight) {
            return prize.prize;
        }
    }
}

router.get("/:lang/dashboard/roulette", isAuthenticated, async (req, res, next) => {
    try {
        const userData = await database.getUser(req.session.user_info.id);
        if (userData.roulette.availableSpins <= 0) {
            return res.status(200).render("../public/pages/dashboard/user/roulette.ejs", {
                user: req.session.user_info,
                db: userData,
                allowed: false,
                result: null
            });
        } else {
            userData.roulette.availableSpins -= 1;
            const prize = getRandomPrize(prizes);
            userData.userCakes.balance += prize;
            userData.userTransactions.push({
                to: req.session.user_info.id,
                from: config.oauth.clientId,
                quantity: prize,
                date: new Date(Date.now()),
                received: true,
                type: 'roulette'
            })
            await userData.save();

            return res.status(200).render("../public/pages/dashboard/user/roulette.ejs", {
                user: req.session.user_info,
                db: userData,
                allowed: true,
                result: prize
            });
        }
    } catch (err) {
        logger.error(err.message);
        return res.status(500).send("Erro interno do servidor");
    }
});

router.get("/riot/connection/status=:status", (req, res) => {
    const status = req.params.status;
    let message, description;
    if (status === "200") {
        message = "Sua conta da Riot Games foi conectada a Foxy",
            description = "Pode fechar esta página e voltar para o Discord"
    } else {
        message = "Sua conta da Riot Games não foi conectada a Foxy",
            description = "Desculpe, mas ocorreu um problema estranho ao conectar sua conta da Riot Games a Foxy. Tente novamente mais tarde."
    }

    if (!req.session.bearer_token) {
        res.status(200).render("../public/pages/info/riotAccountConnected.ejs", {
            user: null,
            message,
            description
        });
    } else {
        res.status(200).render("../public/pages/info/riotAccountConnected.ejs", {
            user: req.session.user_info,
            message,
            description
        });
    }
});

router.get('/:lang/daily', isAuthenticated, async (req, res, next) => {
    try {
        const userId = req.session.user_info.id;
        const userData = await database.getUser(userId);
        const timeout = 43200000;
        const daily = await userData.userCakes.lastDaily;

        var allowed = true;
        if (daily !== null && timeout - (Date.now() - daily) > 0) {
            allowed = false;
        }
        var img = "../assets/images/foxyoculos.png";

        if (allowed) {

            let amount = Math.floor(Math.random() * 8000);
            amount = Math.round(amount / 10) * 10;
            switch (userData.premiumType) {
                case "1": {
                    amount = amount * 1.25;
                    break;
                }

                case "2": {
                    amount = amount * 1.5;
                    break;
                }

                case "3": {
                    amount = amount * 2;
                    break;
                }
            }
            if (amount < 1000) amount = 1000;

            userData.userCakes.balance += amount;
            userData.userCakes.lastDaily = Date.now();
            userData.save().catch(err => logger.log(err));

            req.session.coins = amount;
            req.session.dbCoins = userData.userCakes.balance;
        } else {
            req.session.coins = 0;
            req.session.dbCoins = userData.userCakes.balance;
        }

        res.status(200).render("../public/pages/dashboard/user/daily.ejs", {
            user: req.session.user_info,
            coins: req.session.coins.toLocaleString('pt-BR'),
            img: img,
            dbCoins: req.session.dbCoins.toLocaleString('pt-BR'),
            allowed
        });
    } catch (error) {
        next(error);
    }
});

router.get('/:lang/delete', isAuthenticated, async (req, res, next) => {
    try {
        const userId = req.session.user_info.id;
        const userData = await database.getUser(userId);
        const marriedData = await database.getUser(userId);

        marriedData.marriedWith = null;
        marriedData.save()
        userData.remove().catch(err => logger.error(err));
        req.session.destroy();
        return res.status(200).render("../public/pages/utils/deletedUser.ejs");
    } catch (error) {
        next(error);
    }
});

const categoryTranslation = {
    br: {
        roleplay: "Roleplay",
        fun: "Diversão",
        games: "Jogos",
        economy: "Economia",
        image: "Imagens",
        noCategory: "Sem Categoria",
        social: "Social",
        util: "Utilitários",
    },
    en: {
        roleplay: "Roleplay",
        fun: "Fun",
        games: "Games",
        economy: "Economy",
        noCategory: "No Category",
        image: "Images",
        social: "Social",
        util: "Utilities",
    }
};

function translate(categoryId, lang) {
    const langTranslations = categoryTranslation[lang] || categoryTranslation['en'];
    return langTranslations[categoryId] || categoryId;
}

router.get("/:lang/commands/", async (req, res, next) => {
    try {
        const commandsList = await database.getAllCommands();
        const allCommands = commandsList.filter(command =>
            command.description && command.commandName !== "foxytools"
        );

        res.status(200).render("../public/pages/info/commands/allCommands.ejs", {
            user: req.session.user_info,
            allCommands
        });
    } catch (error) {
        next(error);
    }
});

router.get("/:lang/commands/:category", async (req, res, next) => {
    try {
        const category = req.params.category;

        const commandsList = await database.getAllCommands();
        const commands = commandsList.filter(command => command.category === category);
        const filteredCommands = commandsList.filter(command => command.description && command.commandName !== "foxytools");
        res.status(200).render("../public/pages/info/commands/category.ejs", {
            user: req.session.user_info,
            commands,
            category: translate(category, req.params.lang),
            allCommands: filteredCommands
        });
    } catch (error) {
        next(error);
    }
});

router.get('/:lang/confirm', isAuthenticated, async (req, res, next) => {
    try {
        const userData = await database.getUser(req.session.user_info.id);
        res.status(200).render("../public/pages/utils/confirm.ejs", {
            user: req.session.user_info,
            db: userData
        });
    } catch (error) {
        next(error);
    }
});

router.get('/:lang/support', async (req, res, next) => {
    try {
        res.status(200).render("../public/pages/info/support.ejs", {
            user: req.session.user_info,
        });
    } catch (error) {
        next(error);
    }
});

router.get('/:lang/support/ban-appeal', async (req, res, next) => {
    try {
        res.status(200).render("../public/pages/info/banAppeal.ejs", {
            user: req.session.user_info,
        });
    } catch (error) {
        next(error);
    }
});

router.post("/:lang/submit", isAuthenticated, async (req, res, next) => {
    try {
        const userData = await database.getUser(req.session.user_info.id);
        userData.aboutme = req.body.aboutme;
        userData.save().catch(err => logger.log(err));
        return res.redirect('/dashboard');
    } catch (error) {
        next(error);
    }
});

router.get('/:lang/error', (req, res) => {
    res.status(200).render("../public/pages/errors/error.ejs", {
        user: req.session.user_info
    });
});

router.get('/:lang/404', (req, res) => {
    res.status(200).render("../public/pages/errors/404.ejs", {
        user: req.session.user_info
    });
});

router.use(errorHandler);

module.exports = router;