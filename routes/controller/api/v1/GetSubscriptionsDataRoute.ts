import { Router } from "express";
import RouterUtils from "../../RouterUtils";
import { database } from "../../../../client/app";

export default class GetSubscriptionsDataRoute {
    private manager: RouterUtils;

    constructor(route: Router) {
        this.manager = new RouterUtils();
        route.get("/:lang/dashboard/subscriptions/data", this.manager.isAuthenticated, this.getSubscriptionsData);
    }

    async getSubscriptionsData(req, res) {
        const userId = req.session.user_info.id;
        const userData = await database.getUser(userId);
        const usersCheckous = await database.getCheckouts(userId);
        const responseData = {
            user: req.session.user_info,
            userData: userData,
            currentSubscription: {
                premiumType: userData.userPremium.premiumType,
                premiumDate: userData.userPremium.premiumDate,
                premium: userData.userPremium.premium
            },
            userCakes: userData.userCakes,
            userCheckouts: usersCheckous
        }

        res.status(200).json(responseData);
    }
}