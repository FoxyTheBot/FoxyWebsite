import { Router } from "express";
import RouterManager from "../RouterUtils";
import { database } from "../../../client/app";

export default class GetUserBackgroundInventoryRoute {
    private manager: RouterManager;

    constructor(route: Router) {
        this.manager = new RouterManager();
        route.use("/partials/user/background-inventory", this.manager.isAuthenticated, this.getUserBackgroundInventory.bind(this))
    }

    private async getUserBackgroundInventory(req, res) {
        const userId = req.session.user_info.id;
        const userData = await database.getUser(userId);
        const backgrounds = await database.getAllBackgrounds();
        const userBackgrounds = await Promise.all(userData.userProfile.backgroundList.map(
            id => database.getBackground(id)));

        this.manager.renderPartial(req, res, 'background-inventory', false, {
            userBackgrounds,
            currentBackground: userData.userProfile.background,
            storeContent: backgrounds
        });
    }
}