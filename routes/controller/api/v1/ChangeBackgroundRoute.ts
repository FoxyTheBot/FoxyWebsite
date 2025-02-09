import { Router } from "express";
import RouterUtils from "../../RouterUtils";
import { database } from "../../../../client/app";
import { constants } from "../../../../structures/constants";

export default class ChangeBackgroundRoute {
    private manager: RouterUtils;

    constructor(route: Router) {
        this.manager = new RouterUtils();
        route.get("/:lang/background/change/:id", this.manager.isAuthenticated, this.changeBackground);
    }

    async changeBackground(req, res, next) {
        try {
            const userId = req.session.user_info.id;
            const userData = await database.getUser(userId);
            const background = await database.getBackground(req.params.id);

            if (!background) {
                return res.redirect(constants.USER_STORE);
            }

            if (!userData.userProfile.backgroundList.includes(background.id)) {
                return res.redirect(constants.USER_STORE);
            }

            userData.userProfile.background = background.id;
            await userData.save();
            return res.status(200).json({ success: true });
        } catch (error) {
            next(error);
        }
    }
}