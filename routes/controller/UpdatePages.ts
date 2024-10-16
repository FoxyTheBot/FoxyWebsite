import express from 'express';
import { database } from '../../client/app';
import { logger } from '../../structures/logger';
import RouterManager from './RouterManager';

class UpdatePages {
    router: express.Router;
    routerManager: RouterManager;
    categoryTranslation: object;

    constructor() {
        this.router = express.Router();
        this.routerManager = new RouterManager();
        this.categoryTranslation = {
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
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.use(this.routerManager.checkSession);

        this.router.get("/", this.routerManager.renderPage("../public/pages/index.ejs"));

        this.router.get("/:lang/support/guidelines", this.routerManager.renderPage("../public/pages/info/guidelines.ejs"));

        this.router.get('/:lang/premium', this.routerManager.renderPage("../public/pages/info/premium.ejs"));

        this.router.get("/:lang/support/terms", this.routerManager.renderPage("../public/pages/info/privacy.ejs"));

        this.router.get("/:lang/store", this.routerManager.isAuthenticated, this.storeHandler);

        this.router.get("/:lang/store/layouts", this.routerManager.isAuthenticated, this.layoutHandler);

        this.router.get("/checkout", this.routerManager.isAuthenticated, this.checkoutHandler);

        this.router.get("/:lang/rso/login", this.rsoLoginHandler);

        this.router.get("/:lang/dashboard", this.routerManager.isAuthenticated, this.dashboardHandler);

        this.router.get("/:lang/user/decorations", this.routerManager.isAuthenticated, this.userDecorationsHandler);

        this.router.get("/riot/connection/status=:status", this.riotConnectionStatusHandler);

        this.router.get('/:lang/daily', this.routerManager.isAuthenticated, this.dailyHandler);

        this.router.get('/:lang/delete', this.routerManager.isAuthenticated, this.deleteUserHandler);

        this.router.get("/:lang/commands/", this.commandsHandler);

        this.router.get("/:lang/commands/:category", this.categoryCommandsHandler);

        this.router.get('/:lang/confirm', this.routerManager.isAuthenticated, this.confirmHandler);

        this.router.get('/:lang/support', this.supportHandler);

        this.router.get('/:lang/support/ban-appeal', this.banAppealHandler);

        this.router.get('/:lang/error', this.errorHandler);

        this.router.get('/:lang/404', this.notFoundHandler);

        this.router.use(this.routerManager.errorHandler);
    }

    storeHandler = async (req, res, next) => {
        try {
            res.status(200).render("../public/pages/dashboard/store/background.ejs", {
                user: req.session.user_info,
            });
        } catch (error) {
            next(error);
        }
    }

    layoutHandler = (req, res) => {
        res.status(200).send("Soon");
    }

    checkoutHandler = async (req, res) => {
        const { itemId } = req.query;

        const checkoutItem = await database.createCheckout(req.session.user_info.id.toString(), itemId.toString());

        res.status(200).redirect(process.env.FP_URL + "checkout/id/" + checkoutItem.checkoutId);
    }

    rsoLoginHandler = (req, res) => {
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
    }

    dashboardHandler = async (req, res) => {
        res.status(200).render("../public/pages/dashboard/user/inventory/backgrounds.ejs");
    }

    userDecorationsHandler = async (req, res, next) => {
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
    }

    riotConnectionStatusHandler = (req, res) => {
        const status = req.params.status;
        let message, description;
        if (status === "200") {
            message = "Sua conta da Riot Games foi conectada a Foxy";
            description = "Pode fechar esta página e voltar para o Discord";
        } else {
            message = "Sua conta da Riot Games não foi conectada a Foxy";
            description = "Desculpe, mas ocorreu um problema estranho ao conectar sua conta da Riot Games a Foxy. Tente novamente mais tarde.";
        }

        res.status(200).render("../public/pages/info/riotAccountConnected.ejs", {
            user: req.session.bearer_token ? req.session.user_info : null,
            message,
            description
        });
    }

    dailyHandler = async (req, res, next) => {
        try {
            const userId = req.session.user_info.id;
            const userData = await database.getUser(userId);
            const timeout = 43200000;
            const daily = await userData.userCakes.lastDaily;

            const allowed = !(daily !== null && timeout - (Date.now() - daily) > 0);

            res.status(200).render("../public/pages/dashboard/user/economy/daily.ejs", {
                user: req.session.user_info,
                allowed
            });
        } catch (error) {
            next(error);
        }
    }

    deleteUserHandler = async (req, res, next) => {
        try {
            const userId = req.session.user_info.id;
            const userData = await database.getUser(userId);

            userData.remove().catch(err => logger.error(err));
            req.session.destroy();
            return res.status(200).render("../public/pages/utils/deletedUser.ejs");
        } catch (error) {
            next(error);
        }
    }

    commandsHandler = async (req, res, next) => {
        try {
            const commandsList = await database.getAllCommands();
            const allCommands = commandsList.filter(command => command.description && command.commandName !== "foxytools");

            res.status(200).render("../public/pages/info/commands/allCommands.ejs", {
                user: req.session.user_info,
                allCommands
            });
        } catch (error) {
            next(error);
        }
    }

    categoryCommandsHandler = async (req, res, next) => {
        try {
            const category = req.params.category;
            const commandsList = await database.getAllCommands();
            const commands = commandsList.filter(command => command.category === category);
            const filteredCommands = commandsList.filter(command => command.description && command.commandName !== "foxytools");

            res.status(200).render("../public/pages/info/commands/category.ejs", {
                user: req.session.user_info,
                commands,
                category: this.translate(category, req.params.lang),
                allCommands: filteredCommands
            });
        } catch (error) {
            next(error);
        }
    }

    confirmHandler = async (req, res, next) => {
        try {
            const userData = await database.getUser(req.session.user_info.id);
            res.status(200).render("../public/pages/utils/confirm.ejs", {
                user: req.session.user_info,
                db: userData
            });
        } catch (error) {
            next(error);
        }
    }

    supportHandler = async (req, res, next) => {
        try {
            res.status(200).render("../public/pages/info/support.ejs", {
                user: req.session.user_info,
            });
        } catch (error) {
            next(error);
        }
    }

    banAppealHandler = async (req, res, next) => {
        try {
            res.status(200).render("../public/pages/info/banAppeal.ejs", {
                user: req.session.user_info,
            });
        } catch (error) {
            next(error);
        }
    }

    errorHandler = (req, res) => {
        res.status(200).render("../public/pages/errors/error.ejs", {
            user: req.session.user_info
        });
    }

    notFoundHandler = (req, res) => {
        res.status(200).render("../public/pages/errors/404.ejs", {
            user: req.session.user_info
        });
    }

    translate(categoryId, lang) {
        const langTranslations = this.categoryTranslation[lang] || this.categoryTranslation['en'];
        return langTranslations[categoryId] || categoryId;
    }

    getRouter() {
        return this.router;
    }
}

export default UpdatePages;