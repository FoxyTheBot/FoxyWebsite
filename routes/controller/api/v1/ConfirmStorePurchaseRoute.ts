import { Router } from "express";
import RouterUtils from "../../RouterUtils";
import { database } from "../../../../client/app";
import { constants } from "../../../../structures/constants";
import { logger } from "../../../../structures/logger";
import { TransactionType } from "../../../../types/Transactions";
import config from '../../../../config.json';

export default class ConfirmStorePurchaseRoute {
    private manager: RouterUtils;

    constructor(route: Router) {
        this.manager = new RouterUtils();
        route.post("/:lang/store/confirm/:id", this.manager.isAuthenticated, this.confirmStore);
    }

    async confirmStore(req, res, next) {
        try {
            const userId = req.session.user_info.id;
            const userData = await database.getUser(userId);
            const decoration = await database.getDecoration(req.params.id);
            const background = await database.getBackground(req.params.id);
            const layout = await database.getLayout(req.params.id);
            const item = decoration || background || layout;
            const itemType = decoration ? 'decoration' : background ? 'background' : layout ? 'layout' : null;


            function isUserPremium(userData) {
                if (userData.userPremium.premiumDate > Date.now()) {
                    return {
                        isPremium: true,
                        premiumType: userData.userPremium.premiumType
                    }
                } else {
                    return {
                        isPremium: false,
                        premiumType: null
                    }
                }
            }

            if (itemType === 'decoration' && isUserPremium(userData).isPremium) {
                if (userData.userPremium.premiumType === "2" ||
                    userData.userPremium.premiumType === "3" ||
                    userData.userPremium.premiumType === "Foxy Premium II" ||
                    userData.userPremium.premiumType === "Foxy Premium III") {
                    item.cakes = item.cakes * 0.5;
                    logger.info(`User ${userId} has a premium account and received a 50% discount on the item ${item.id}`);
                }
            }

            if (!item) {
                logger.info(`User ${userId} tried to purchase an invalid item from the store`);
                return res.redirect(constants.USER_STORE);
            }

            if (userData.userCakes.balance < item.cakes) {
                logger.info(`User ${userId} tried to purchase an item without enough cakes`);
                return res.redirect(constants.USER_STORE);
            }

            const alreadyPurchased = (itemType === 'decoration' && userData.userProfile.decorationList.includes(item.id)) ||
                (itemType === 'background' && userData.userProfile.backgroundList.includes(item.id) ||
                    (itemType === 'layout' && userData.userProfile.layoutList.includes(item.id)));

            if (alreadyPurchased) {
                logger.info(`User ${userId} tried to purchase an item they already own`);
                return res.redirect(constants.USER_STORE);
            }

            userData.userCakes.balance -= item.cakes;

            if (itemType === 'decoration') {
                userData.userProfile.decorationList.push(item.id);
            } else if (itemType === 'background') {
                userData.userProfile.backgroundList.push(item.id);
            } else {
                userData.userProfile.layoutList.push(item.id);
            }

            userData.userTransactions.push({
                to: config.oauth.clientId,
                from: userId,
                quantity: item.cakes,
                date: new Date(),
                received: false,
                type: TransactionType.SPENT_AT_STORE
            });

            await userData.save();
            return res.redirect(constants.USER_STORE);
        } catch (error) {
            next(error);
        }
    }
}