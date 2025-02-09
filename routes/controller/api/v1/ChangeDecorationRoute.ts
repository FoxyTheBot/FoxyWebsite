import { Router } from "express";
import RouterUtils from "../../RouterUtils";
import { database } from "../../../../client/app";
import { constants } from "../../../../structures/constants";

export default class ChangeDecorationRoute {
    private manager: RouterUtils;

    constructor(route: Router) {
        this.manager = new RouterUtils();
        route.get("/:lang/decorations/change/:id", this.manager.isAuthenticated, this.changeDecoration);
    }

    async changeDecoration(req, res, next) {
        try {
            const userId = req.session.user_info.id;
            const userData = await database.getUser(userId);
            const decoration = await database.getDecoration(req.params.id);

            if (req.params.id === "none") {
                userData.userProfile.decoration = null;
                await userData.save();
                return res.redirect(constants.USER_DECORATIONS);
            }

            if (!decoration) {
                return res.redirect(constants.USER_STORE);
            }

            if (!userData.userProfile.decorationList.includes(decoration.id)) {
                return res.redirect(constants.USER_STORE);
            }

            userData.userProfile.decoration = decoration.id;
            await userData.save();
            return res.redirect(constants.USER_DECORATIONS);
        } catch (error) {
            next(error);
        }
    }
}