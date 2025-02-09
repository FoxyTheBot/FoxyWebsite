import { Router } from "express";
import RouterUtils from "../../RouterUtils";
import { database } from "../../../../client/app";

export default class GetUserLayoutRoute {
    private manager: RouterUtils;

    constructor(route: Router) {
        this.manager = new RouterUtils();
        route.get("/:lang/user/layouts/data", this.manager.isAuthenticated, this.getUserLayouts)
    }

    async getUserLayouts(req, res) {
        const userId = req.session.user_info.id;
        const userData = await database.getUser(userId);
        const layouts = await database.getAllLayouts();
        const userLayouts = await Promise.all(userData.userProfile.layoutList.map(id => database.getLayout(id)));

        const responseData = {
            user: req.session.user_info,
            userLayouts: userLayouts,
            currentLayout: userData.userProfile.layout,
            storeContent: { layouts }
        };

        res.status(200).json(responseData);
    }
}