import { Router } from "express";
import RouterUtils from "../../RouterUtils";
import { database } from "../../../../client/app";

export default class GetUserBackgrounds {
    private manager: RouterUtils;

    constructor(route: Router) {
        this.manager = new RouterUtils();
        route.get("/:lang/user/backgrounds/data", this.manager.isAuthenticated, this.getUserBackgrounds);
    }

    async getUserBackgrounds(req, res) {
        const userId = req.session.user_info.id;
        const userData = await database.getUser(userId);
        const backgrounds = await database.getAllBackgrounds();
        const userBackgrounds = await Promise.all(userData.userProfile.backgroundList.map(
            id => database.getBackground(id)));

        const responseData = {
            user: req.session.user_info,
            userBackgrounds: userBackgrounds,
            currentBackground: userData.userProfile.background,
            storeContent: { backgrounds }
        };

        res.status(200).json(responseData);
    }
}