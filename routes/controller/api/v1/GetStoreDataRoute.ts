import { Router } from "express";
import RouterUtils from "../../RouterUtils";
import { database } from "../../../../client/app";

export default class GetStoreDataRoute {
    private manager: RouterUtils;

    constructor(route: Router) {
        this.manager = new RouterUtils();
        route.get("/:lang/store/data", this.manager.isAuthenticated, this.getStoreData);
    }

    async getStoreData(req, res) {
        try {
            const userId = req.session.user_info.id;
            const [userData, storeItems, allDecorations, allLayouts] = await Promise.all([
                database.getUser(userId),
                database.getStore(),
                database.getAllDecorations(),
                database.getAllLayouts()
            ]);

            const backgroundsInStore = storeItems.itens
                .filter(item => item.type === 'background')
                .map(item => item.id);

            const decorationsInStore = storeItems.itens
                .filter(item => item.type === 'decoration')
                .map(item => item.id);

            const layoutsInStore = storeItems.itens
                .filter(item => item.type === 'layout')
                .map(item => item.id);

            const storeBackgrounds = await Promise.all(
                backgroundsInStore.map(id => database.getBackground(id))
            );

            const storeDecorations = decorationsInStore.map(id =>
                allDecorations.find(decoration => decoration.id === id)
            );

            const storeLayouts = layoutsInStore.map(id =>
                allLayouts.find(layout => layout.id === id)
            );

            const premiumType = userData.userPremium.premiumType;
            if (userData.userPremium.premiumDate > Date.now()) {
                if (premiumType === "2" || premiumType === "3" || premiumType === "Foxy Premium II" || premiumType === "Foxy Premium III") {
                    storeDecorations.forEach(decoration => {
                        decoration.cakes = decoration.cakes * 0.5;
                    });
                }
            }

            const responseData = {
                user: req.session.user_info,
                userData: userData,
                userBackgrounds: userData.userProfile.backgroundList,
                userDecorations: userData.userProfile.decorationList,
                storeContent: {
                    backgrounds: storeBackgrounds,
                    decorations: storeDecorations,
                    layouts: storeLayouts
                },
                lastUpdate: storeItems.lastUpdate
            };

            res.status(200).json(responseData);
        } catch (error) {
            console.error(`[API] Error fetching store data: ${error.message}`);
            res.status(500).json({ error: 'Failed to load store data' });
        }
    }
}