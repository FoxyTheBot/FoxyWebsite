import express from 'express';
import RouterUtils from './RouterUtils';
import GetServerConfigRoute from './api/v1/GetServerConfigRoute';
import GetServerWelcomerRoute from './api/v1/GetServerWelcomerRoute';
import SaveGeneralSettingsRoute from './api/v1/SaveGeneralSettingsRoute';
import SaveWelcomerModuleRoute from './api/v1/SaveWelcomerModuleRoute';
import GetServerChannelsRoute from './api/v1/GetServerChannelsRoute';
import GetDailyShopRoute from './partials/GetDailyShopRoute';
import GetModuleRoute from './partials/GetModuleRoute';
import GetServerLogsRoute from './partials/GetServerLogsRoute';
import GetServersDataRoute from './partials/GetServersDataRoute';
import GetUserBackgroundInventoryRoute from './partials/GetUserBackgroundInventoryRoute';
import GetUserBackgrounds from './api/v1/GetUserBackgroundsRoute';
import ModuleRoute from './dashboard/guild/ModuleRoute';
import GetUserLayoutRoute from './api/v1/GetUserLayoutsRoute';
import ReceiveDailyRoute from './api/v1/ReceiveDailyRoute';
import GetSubscriptionsDataRoute from './api/v1/GetSubscriptionsDataRoute';
import GetStoreDataRoute from './api/v1/GetStoreDataRoute';
import ConfirmStorePurchaseRoute from './api/v1/ConfirmStorePurchaseRoute';
import ChangeLayoutRoute from './api/v1/ChangeLayoutRoute';
import ChangeDecorationRoute from './api/v1/ChangeDecorationRoute';
import ChangeBackgroundRoute from './api/v1/ChangeBackgroundRoute';
import PostPartnershipRoute from './api/v1/PostPartnershipRoute';
import PostWelcomerTestRoute from './api/v1/PostWelcomerTestRoute';
import GetUserDecorationsRoute from "./api/v1/GetUserDecorationsRoute";

class RouterManager {
    router: express.Router;
    routerManager: RouterUtils;

    constructor() {
        this.router = express.Router();
        this.routerManager = new RouterUtils();
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.use(this.routerManager.errorHandler);
        this.router.get("/:lang/user/layouts", this.routerManager.isAuthenticated, this.routerManager.renderPage("../public/pages/dashboard/user/inventory/layouts.ejs"));

        /* ===[API Routes]=== */
        new GetServerConfigRoute(this.router);
        new GetServerWelcomerRoute(this.router);
        new GetServerConfigRoute(this.router);
        new GetServerChannelsRoute(this.router);
        new SaveGeneralSettingsRoute(this.router);
        new SaveWelcomerModuleRoute(this.router);
        new PostWelcomerTestRoute(this.router);
        new PostPartnershipRoute(this.router);

        /* ===[Partials Routes]=== */
        new GetDailyShopRoute(this.router);
        new GetModuleRoute(this.router);
        new GetServerLogsRoute(this.router);
        new GetServersDataRoute(this.router);
        new GetUserBackgroundInventoryRoute(this.router);

        /* ===[User Dashboard Routes]=== */
        new ChangeBackgroundRoute(this.router);
        new ChangeDecorationRoute(this.router);
        new ChangeLayoutRoute(this.router);
        new ConfirmStorePurchaseRoute(this.router);
        new GetStoreDataRoute(this.router);
        new GetSubscriptionsDataRoute(this.router);
        new GetUserBackgrounds(this.router);
        new GetUserLayoutRoute(this.router);
        new ReceiveDailyRoute(this.router);
        new GetUserDecorationsRoute(this.router);

        /* ===[Guild Dashboard Routes]=== */
        new ModuleRoute(this.router);
    }

    getRouter() {
        return this.router;
    }
}


export default RouterManager;