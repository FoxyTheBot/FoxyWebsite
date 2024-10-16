import express from 'express';
import config from '../../config.json';
import { database } from '../../client/app';
import RouterManager from './RouterManager';
import { TransactionType } from '../../types/Transactions';

class DashboardRoutes {
    router: express.Router;
    routerManager: RouterManager;

    constructor() {
        this.router = express.Router();
        this.routerManager = new RouterManager();
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get("/br/user/backgrounds/data", this.routerManager.isAuthenticated, this.getUserBackgrounds);
        this.router.post("/:lang/store/confirm/:id", this.routerManager.isAuthenticated, this.confirmStore);
        this.router.get("/:lang/background/change/:id", this.routerManager.isAuthenticated, this.changeBackground);
        this.router.get("/:lang/decorations/change/:id", this.routerManager.isAuthenticated, this.changeDecoration);
        this.router.post("/:lang/dashboard/daily/receive", this.routerManager.isAuthenticated, this.receiveDaily);
        this.router.get("/:lang/store/data", this.routerManager.isAuthenticated, this.getStoreData);
        this.router.use(this.routerManager.errorHandler);
    }

    getRouter() {
        return this.router;
    }

    async getStoreData(req, res) {
        try {
            const userId = req.session.user_info.id;
            const [userData, storeItems, allDecorations] = await Promise.all([
                database.getUser(userId),
                database.getStore(),
                database.getAllDecorations()
            ]);
    
            const backgroundsInStore = storeItems.itens
                .filter(item => item.type === 'background')
                .map(item => item.id);
    
            const decorationsInStore = storeItems.itens
                .filter(item => item.type === 'decoration')
                .map(item => item.id);
    
            const storeBackgrounds = await Promise.all(
                backgroundsInStore.map(id => database.getBackground(id))
            );
    
            const storeDecorations = decorationsInStore.map(id => 
                allDecorations.find(decoration => decoration.id === id)
            );
    
            const responseData = {
                user: req.session.user_info,
                userData: userData,
                userBackgrounds: userData.userProfile.backgroundList,
                userDecorations: userData.userProfile.decorationList,
                storeContent: {
                    backgrounds: storeBackgrounds,
                    decorations: storeDecorations
                },
                lastUpdate: storeItems.lastUpdate
            };
    
            res.status(200).json(responseData);
        } catch (error) {
            console.error(`[API] Error fetching store data: ${error.message}`);
            res.status(500).json({ error: 'Failed to load store data' });
        }
    }
    

    async getUserBackgrounds(req, res) {
        const userId = req.session.user_info.id;
        const userData = await database.getUser(userId);
        const backgrounds = await database.getAllBackgrounds();
        const userBackgrounds = await Promise.all(userData.userProfile.backgroundList.map(id => database.getBackground(id)));

        const responseData = {
            user: req.session.user_info,
            userBackgrounds: userBackgrounds,
            currentBackground: userData.userProfile.background,
            storeContent: { backgrounds }
        };

        res.status(200).json(responseData);
    }

    async confirmStore(req, res, next) {
        try {
            const userId = req.session.user_info.id;
            const userData = await database.getUser(userId);
            const decoration = await database.getDecoration(req.params.id);
            const background = await database.getBackground(req.params.id);
            const item = decoration || background;
            const itemType = decoration ? 'decoration' : background ? 'background' : null;

            if (!item) {
                return this.sendAlert(res, 'Este item não existe', '/br/store');
            }

            if (userData.userCakes.balance < item.cakes) {
                return this.sendAlert(res, 'Você não tem cakes suficientes para comprar este item', '/br/store');
            }

            const alreadyPurchased = (itemType === 'decoration' && userData.userProfile.decorationList.includes(item.id)) ||
                (itemType === 'background' && userData.userProfile.backgroundList.includes(item.id));

            if (alreadyPurchased) {
                return this.sendAlert(res, `Você já possui este ${itemType}`, '/br/store');
            }

            userData.userCakes.balance -= item.cakes;
            if (itemType === 'decoration') {
                userData.userProfile.decorationList.push(item.id);
            } else {
                userData.userProfile.backgroundList.push(item.id);
            }

            userData.userTransactions.push({
                to: config.oauth.clientId,
                from: userId,
                quantity: item.cakes,
                date: new Date(),
                received: false,
                type: TransactionType.SPENT_AT_STORE
            });

            await userData.save();
            return res.redirect(itemType === 'decoration' ? "/br/user/decorations" : "/br/dashboard");
        } catch (error) {
            next(error);
        }
    }

    async changeBackground(req, res, next) {
        try {
            const userId = req.session.user_info.id;
            const userData = await database.getUser(userId);
            const background = await database.getBackground(req.params.id);

            if (!background) {
                return this.sendAlert(res, 'Este item não existe', '/br/store');
            }

            if (!userData.userProfile.backgroundList.includes(background.id)) {
                return this.sendAlert(res, 'Você não possui este item', '/br/store');
            }

            userData.userProfile.background = background.id;
            await userData.save();
            return res.status(200).json({ success: true });
        } catch (error) {
            next(error);
        }
    }

    async changeDecoration(req, res, next) {
        try {
            const userId = req.session.user_info.id;
            const userData = await database.getUser(userId);
            const decoration = await database.getDecoration(req.params.id);

            if (!decoration) {
                return this.sendAlert(res, 'Esta decoração não existe', '/br/store');
            }

            if (!userData.userProfile.decorationList.includes(decoration.id)) {
                return this.sendAlert(res, 'Você não possui esta decoração', '/br/store');
            }

            userData.userProfile.decoration = decoration.id;
            await userData.save();
            return res.redirect("/br/user/decorations");
        } catch (error) {
            next(error);
        }
    }

    async receiveDaily(req, res, next) {
        try {
            const userId = req.session.user_info.id;
            const userData = await database.getUser(userId);
            const timeout = 43200000;
            const daily = userData.userCakes.lastDaily;

            if (daily !== null && timeout - (Date.now() - daily) > 0) {
                return this.sendAlert(res, 'Você já coletou seu daily hoje', '/br/dashboard');
            }

            let amount = Math.floor(Math.random() * 8000);
            amount = Math.round(amount / 10) * 10;

            switch (userData.userPremium.premiumType) {
                case "1": amount *= 1.25; break;
                case "2": amount *= 1.5; break;
                case "3": amount *= 2; break;
            }

            if (amount < 1000) amount = 1000;

            userData.userCakes.balance += amount;
            userData.userCakes.lastDaily = Date.now();
            userData.userTransactions.push({
                to: config.oauth.clientId,
                from: userId,
                quantity: amount,
                date: new Date(),
                received: true,
                type: TransactionType.DAILY_REWARD
            });

            await userData.save();
            res.status(200).json({ coins: amount, totalCoins: userData.userCakes.balance });
        } catch (error) {
            next(error);
        }
    }

    sendAlert(res, message, redirectUrl) {
        return res.status(200).send(`<script>alert('${message}'); window.location.href = '${redirectUrl}';</script>`);
    }

    createTransaction(userId, quantity, received = false, type: TransactionType) {
        return {
            to: config.oauth.clientId,
            from: userId,
            quantity: Number(quantity),
            date: new Date(),
            received,
            type: type
        };
    }
}

export default DashboardRoutes;
