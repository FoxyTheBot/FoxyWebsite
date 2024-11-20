import { database } from "../../client/app";
import { constants } from "../../structures/constants";
import { logger } from "../../structures/logger";
import { ActionType } from "../../types/dashboardLog";

export default class RouterManager {
    constructor() { }

    public checkSession = (req, res, next) => {
        if (!req.session.bearer_token) {
            req.session.user_info = null;
        }
        next();
    }

    public isAuthenticated = (req, res, next) => {
        if (!req.session.bearer_token) {
            return res.redirect('/login');
        }
        next();
    }

    public errorHandler = (err, req, res, next) => {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }

    public renderPage = (page, options = {}) => (req, res) => {
        res.status(200).render(page, {
            user: req.session.user_info,
            ...options
        });
    }

    public redirectTo(res, redirectUrl) {
        return res.redirect(redirectUrl);
    }

    public renderPartial = async (req, res, page, isModule = false, data) => {
        try {
            if (isModule) {
                res.status(200).render(`../public/pages/partials/modules/${page}.ejs`, {
                    user: req.session.user_info,
                    ...data
                });
            } else {
                res.status(200).render(`../public/pages/partials/${page}.ejs`, {
                    user: req.session.user_info,
                    ...data
                });
            }
        } catch (err) {
            logger.error(err);
        }
    }

    public getUserCurrentGuild = async (req, res, guildId) => {
        if (!guildId) throw new Error('Guild ID not found.');
        const guildInfo = await database.getGuild(guildId);

        if (!guildInfo) {
            res.redirect(constants.INVITE_BOT(guildId));
            return true;
        }

        let userGuildsResponse;
        let attempts = 0;

        while (attempts < 3) {
            userGuildsResponse = await fetch(constants.USER_GUILDS, {
                headers: {
                    authorization: `${req.session.oauth_type} ${req.session.bearer_token}`
                }
            });

            if (userGuildsResponse.status === 429) {
                const rateLimitData = await userGuildsResponse.json();
                const waitTime = rateLimitData.retry_after * 1000;
                await new Promise(resolve => setTimeout(resolve, waitTime));
                attempts++;
            } else {
                break;
            }
        }

        if (userGuildsResponse.status === 429) {
            logger.error("Rate limit exceeded. Please try again later.");
            return true;
        }

        const guilds = await userGuildsResponse.json();
        const currentGuild = guilds.find((g) => g.id === guildId);
        if (!currentGuild) {
            res.redirect(constants.DASHBOARD);
            return true;
        }

        const isUserAuthorized = this.checkUserPermissions(currentGuild.permissions);

        if (!currentGuild.permissions || !isUserAuthorized) {
            res.redirect(constants.DASHBOARD);
            return true;
        }

        return false;
    }

    checkUserPermissions(permission): boolean {
        return (permission & (8 | 32)) !== 0;
    }


    public async saveToLog(authorId: string, guildId: string, action: ActionType) {
        const log = {
            authorId,
            actionType: action.toString(),
            date: new Date()
        }

        const guildData = await database.getGuild(guildId);
        guildData.dashboardLogs.push(log);
        await guildData.save();
    }
}