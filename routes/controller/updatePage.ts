import express from 'express';
import config from '../../config.json';
import { database } from '../../client/app';
import { logger } from '../../structures/logger';
import RouterManager from './RouterManager';

const router = express.Router();
const routerManager = new RouterManager();

router.use(routerManager.checkSession);

router.get("/", routerManager.renderPage("../public/pages/index.ejs"));

router.get("/:lang/support/guidelines", routerManager.renderPage("../public/pages/info/guidelines.ejs"));

router.get('/:lang/premium', routerManager.renderPage("../public/pages/info/premium.ejs"));

router.get("/:lang/support/terms", routerManager.renderPage("../public/pages/info/privacy.ejs"));

router.get("/:lang/store", routerManager.isAuthenticated, async (req, res, next) => {
    try {
        res.status(200).render("../public/pages/dashboard/store/background.ejs");
    } catch (error) {
        next(error);
    }
});

router.get("/br/store/data", routerManager.isAuthenticated, async (req, res, next) => {
    try {
        const userData = await database.getUser(req.session.user_info.id);
        const backgrounds = await database.getAllBackgrounds();
        const decorations = await database.getAllDecorations();
        const responseData = {
            user: req.session.user_info,
            userData: userData,
            userBackgrounds: userData.userProfile.backgroundList,
            storeContent: {
                backgrounds: backgrounds,
                decorations: decorations
            }
        };

        res.status(200).json(responseData);
    } catch (error) {
        next(error);
    }
});

router.get("/:lang/store/layouts", routerManager.isAuthenticated, async (req, res, next) => {
    res.status(200).send("Soon");
});

router.get("/checkout", routerManager.isAuthenticated, async (req, res) => {
    const { itemId } = req.query;

    const checkoutItem = await database.createCheckout(req.session.user_info.id.toString(), itemId.toString());

    res.status(200).redirect(process.env.FP_URL + "checkout/id/" + checkoutItem.checkoutId);
});

router.get("/:lang/store/decorations", routerManager.isAuthenticated, async (req, res, next) => {
    try {
        const userData = await database.getUser(req.session.user_info.id);
        const decorations = await database.getAllDecorations();

        res.status(200).render("../public/pages/dashboard/store/decoration.ejs", {
            user: req.session.user_info,
            userDecorations: userData.userProfile.decorationList,
            userData: userData,
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

router.get("/:lang/dashboard", routerManager.isAuthenticated, async (req, res, next) => {
    res.status(200).render("../public/pages/dashboard/user/inventory/backgrounds.ejs");
});

router.get("/:lang/user/decorations", routerManager.isAuthenticated, async (req, res, next) => {
    try {
        const userId = req.session.user_info.id;
        const userData = await database.getUser(userId);
        const decorations = await database.getAllDecorations();
        const userDecorations = [];
        for (let i = 0; i < userData.userProfile.decorationList.length; i++) {
            const decoration = await database.getDecoration(userData.userProfile.decorationList[i]);
            userDecorations.push(decoration);
        }

        res.status(200).render("../public/pages/dashboard/user/inventory/decorations.ejs", {
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

// router.get("/:lang/dashboard/roulette", routerManager.isAuthenticated, async (req, res, next) => {
//     try {
//         const userData = await database.getUser(req.session.user_info.id);
//         if (userData.roulette.availableSpins <= 0) {
//             return res.status(200).render("../public/pages/dashboard/user/economy/roulette.ejs", {
//                 user: req.session.user_info,
//                 db: userData,
//                 allowed: false,
//                 result: null
//             });
//         } else {
//             userData.roulette.availableSpins -= 1;
//             const prize = getRandomPrize(prizes);
//             userData.userCakes.balance += prize;
//             userData.userTransactions.push({
//                 to: req.session.user_info.id,
//                 from: config.oauth.clientId,
//                 quantity: prize,
//                 date: new Date(Date.now()),
//                 received: true,
//                 type: 'roulette'
//             })
//             await userData.save();

//             return res.status(200).render("../public/pages/dashboard/user/roulette.ejs", {
//                 user: req.session.user_info,
//                 db: userData,
//                 allowed: true,
//                 result: prize
//             });
//         }
//     } catch (err) {
//         logger.error(err.message);
//         return res.status(500).send("Erro interno do servidor");
//     }
// });

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

router.get('/:lang/daily', routerManager.isAuthenticated, async (req, res, next) => {
    try {
        const userId = req.session.user_info.id;
        const userData = await database.getUser(userId);
        const timeout = 43200000;
        const daily = await userData.userCakes.lastDaily;

        var allowed = true;
        if (daily !== null && timeout - (Date.now() - daily) > 0) {
            allowed = false;
        }

        res.status(200).render("../public/pages/dashboard/user/economy/daily.ejs", {
            user: req.session.user_info,
            allowed
        });
    } catch (error) {
        next(error);
    }
});

router.get('/:lang/delete', routerManager.isAuthenticated, async (req, res, next) => {
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

router.get('/:lang/confirm', routerManager.isAuthenticated, async (req, res, next) => {
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

router.use(routerManager.errorHandler);

module.exports = router;