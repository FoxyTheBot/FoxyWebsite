import { Router } from "express";
import RouterUtils from "../../RouterUtils";
import { constants } from "../../../../structures/constants";
import { database } from "../../../../client/app";

export default class ChangeLayoutRoute {
    private manager: RouterUtils;

    constructor(route: Router) {
        this.manager = new RouterUtils();
        route.get("/:lang/layouts/change/:id", this.manager.isAuthenticated, this.changeLayout);
    }

    async changeLayout(req, res, next) {
        try {
            const userId = req.session.user_info.id;
            const userData = await database.getUser(userId);
            const layout = await database.getLayout(req.params.id);

            if (!layout) {
                return res.redirect(constants.USER_STORE);
            }

            if (!userData.userProfile.layoutList.includes(layout.id)) {
                return res.redirect(constants.USER_STORE);
            }

            userData.userProfile.layout = layout.id;
            await userData.save();
            return res.status(200).json({ success: true });
        } catch (error) {
            next(error);
        }
    }
}