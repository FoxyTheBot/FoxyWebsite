import { Router } from "express";
import RouterUtils from "../../RouterUtils";
import { database } from "../../../../client/app";
import { constants } from "../../../../structures/constants";

export default class ReceiveDailyRoute {
    private manager: RouterUtils;

    constructor(route: Router) {
        this.manager = new RouterUtils();
        route.post("/:lang/dashboard/daily/receive", this.manager.isAuthenticated, this.receiveDaily);
    }

    async receiveDaily(req, res, next) {
        try {
            const userId = req.session.user_info.id;
            const userData = await database.getUser(userId);
            const timeout = 43200000;
            const daily = userData.userCakes.lastDaily;

            if (daily !== null && timeout - (Date.now() - daily) > 0) {
                return res.redirect(constants.DASHBOARD);
            }

            let amount = Math.floor(Math.random() * 8000);
            amount = Math.round(amount / 10) * 10;

            let multiplier = 1;
            let maxAmount = 8000;

            switch (userData.userPremium.premiumType) {
                case "Foxy Premium I":
                case "1":
                    multiplier = 1.25;
                    maxAmount = 15000;
                    break;
                case "Foxy Premium II":
                case "2":
                    multiplier = 1.5;
                    maxAmount = 20000;
                    break;
                case "Foxy Premium III":
                case "3":
                    multiplier = 2;
                    maxAmount = 25000;
                    break;
            }

            amount = Math.min(Math.floor(amount * multiplier), maxAmount);

            if (amount < 1000) amount = 1000;

            userData.userCakes.balance += amount;
            userData.userCakes.lastDaily = Date.now();
            userData.userCakes.notifiedForDaily = false

            await userData.save();
            res.status(200).json({ coins: amount, totalCoins: userData.userCakes.balance });
        } catch (error) {
            next(error);
        }
    }
}