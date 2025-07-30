import { Router } from "express";
import RouterUtils from "../../RouterUtils";
import { database } from "../../../../client/app";

export default class GetUserDecorationsRoute {
    private manager: RouterUtils;

    constructor(route: Router) {
        this.manager = new RouterUtils();
        route.get("/:lang/user/decorations/data", this.manager.isAuthenticated, this.getUserDecorations)
    }

    async getUserDecorations(req, res) {
        const userId = req.session.user_info.id;
        const userData = await database.getUser(userId);
        const decorations = await database.getAllDecorations();
        const userDecorations = await Promise.all(userData.userProfile.decorationList.map(id => database.getDecoration(id)));

        const responseData = {
            user: req.session.user_info,
            userDecorations: userDecorations,
            currentDecoration: userData.userProfile.decoration,
            storeContent: { decorations }
        };

        res.status(200).json(responseData);
    }
}