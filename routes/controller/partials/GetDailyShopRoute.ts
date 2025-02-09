import { Router } from "express";
import RouterManager from "../RouterUtils";

export default class GetDailyShopRoute {
    private manager: RouterManager;

    constructor(route: Router) {
        this.manager = new RouterManager();
        route.use("/partials/daily-shop", this.manager.isAuthenticated, this.getDailyShop.bind(this))
    }

    private async getDailyShop(req, res) {
        this.manager.renderPartial(req, res, 'daily-shop', false, {});
    }
}