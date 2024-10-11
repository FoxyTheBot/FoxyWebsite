import express from 'express';
import config from '../../config.json';
import { database } from '../../client/app';
import { logger } from '../../structures/logger';
import RouterManager from './RouterManager';

const router = express.Router();
const routerManager = new RouterManager();

router.get("/br/user/backgrounds/data", routerManager.isAuthenticated, async (req, res) => {
    const userData = await database.getUser(req.session.user_info.id);
    const backgrounds = await database.getAllBackgrounds();
    const userBackgrounds = [];
    for (let i = 0; i < userData.userProfile.backgroundList.length; i++) {
        const background = await database.getBackground(userData.userProfile.backgroundList[i]);
        userBackgrounds.push(background);
    }

    const responseData = {
        user: req.session.user_info,
        userBackgrounds: userBackgrounds,
        currentBackground: userData.userProfile.background,
        storeContent: {
            backgrounds: backgrounds
        }
    };

    res.status(200).json(responseData);
});

router.post("/:lang/store/decorations/confirm/:id", routerManager.isAuthenticated, async (req, res, next) => {
    try {
        const userId = req.session.user_info.id;
        const userData = await database.getUser(userId);
        const decoration = await database.getDecoration(req.params.id);
        if (!decoration) {
            return res.status(404).send("<script>alert('Esta decoração não existe'); window.location.href = '/br/store';</script>")
        }

        if (userData.userCakes.balance < decoration.cakes) {
            return res.status(200).send("<script>alert('Você não tem cakes suficientes para comprar esta decoração'); window.location.href = '/br/store';</script>");
        }

        if (userData.userProfile.decorationList.includes(decoration.id)) {
            return res.status(200).send("<script>alert('Você já possui esta decoração'); window.location.href = '/br/store';</script>");
        }

        userData.userProfile.decoration = decoration.id;
        userData.userProfile.decorationList.push(decoration.id);
        userData.userCakes.balance -= decoration.cakes;
        userData.userTransactions.push({
            to: config.oauth.clientId,
            from: req.session.user_info.id,
            quantity: Number(decoration.cakes),
            date: new Date(Date.now()),
            received: false,
            type: 'store'
        });
        userData.save().catch(err => logger.log(err));
        return res.redirect("/br/user/decorations");
    } catch (error) {
        next(error);
    }
});

router.post("/:lang/store/confirm/:id", routerManager.isAuthenticated, async (req, res, next) => {
    try {
        const userId = req.session.user_info.id;
        const userData = await database.getUser(userId);
        
        const decoration = await database.getDecoration(req.params.id);
        const background = await database.getBackground(req.params.id);
        
        const item = decoration || background;
        const itemType = decoration ? 'decoration' : background ? 'background' : null;

        if (!item) {
            return res.status(404).send("<script>alert('Este item não existe'); window.location.href = '/br/store';</script>");
        }

        if (userData.userCakes.balance < item.cakes) {
            return res.status(200).send("<script>alert('Você não tem cakes suficientes para comprar este item'); window.location.href = '/br/store';</script>");
        }

        const alreadyPurchased = (itemType === 'decoration' && userData.userProfile.decorationList.includes(item.id)) ||
                                 (itemType === 'background' && userData.userProfile.backgroundList.includes(item.id));

        if (alreadyPurchased) {
            return res.status(200).send(`<script>alert('Você já possui este ${itemType}'); window.location.href = '/br/store';</script>`);
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
            quantity: Number(item.cakes),
            date: new Date(),
            received: false,
            type: 'store'
        });

        await userData.save();
        if (itemType === 'decoration') {
            return res.redirect("/br/user/decorations");
        } else {
            return res.redirect("/br/dashboard");
        }
    } catch (error) {
        next(error);
    }
});

router.get("/:lang/background/change/:id", routerManager.isAuthenticated, async (req, res, next) => {
    try {
        const userId = req.session.user_info.id;
        const userData = await database.getUser(userId);
        const background = await database.getBackground(req.params.id);
        if (!background) {
            return res.status(404).send("<script>alert('este item não existe'); window.location.href = '/br/store';</script>")
        }

        if (!userData.userProfile.backgroundList.includes(background.id)) {
            return res.status(200).send("<script>alert('Você não possui este item'); window.location.href = '/br/store';</script>");
        }

        userData.userProfile.background = background.id;
        userData.save().catch(err => logger.log(err));
        return res.status(200).json({ success: true });
    } catch (error) {
        next(error);
    }
});

router.get("/:lang/decorations/change/:id", routerManager.isAuthenticated, async (req, res, next) => {
    try {
        const userId = req.session.user_info.id;
        const userData = await database.getUser(userId);
        const decoration = await database.getDecoration(req.params.id);
        if (!decoration) {
            return res.status(404).send("<script>alert('Esta decoração não existe'); window.location.href = '/br/store';</script>")
        }

        if (!userData.userProfile.decorationList.includes(decoration.id)) {
            return res.status(200).send("<script>alert('Você não possui esta decoração'); window.location.href = '/br/store';</script>");
        }

        userData.userProfile.decoration = decoration.id;
        userData.save().catch(err => logger.log(err));
        return res.redirect("/br/user/decorations");
    } catch (error) {
        next(error);
    }
});

router.post("/:lang/dashboard/daily/receive", routerManager.isAuthenticated, async (req, res, next) => {
    try {
        const userId = req.session.user_info.id;
        const userData = await database.getUser(userId);
        const timeout = 43200000;
        const daily = await userData.userCakes.lastDaily;

        if (daily !== null && timeout - (Date.now() - daily) > 0) {
            return res.status(200).send("<script>alert('Você já coletou seu daily hoje'); window.location.href = '/br/dashboard';</script>");
        }
        let amount = Math.floor(Math.random() * 8000);
        amount = Math.round(amount / 10) * 10;

        switch (userData.userPremium.premiumType) {
            case "1": {
                amount = amount * 1.25;
                break;
            }

            case "2": {
                amount = amount * 1.5;
                break;
            }

            case "3": {
                amount = amount * 2;
                break;
            }
        }

        if (amount < 1000) amount = 1000;

        userData.userCakes.balance += amount;
        userData.userCakes.lastDaily = Date.now();
        userData.userTransactions.push({
            to: req.session.user_info.id,
            from: config.oauth.clientId,
            quantity: amount,
            date: new Date(Date.now()),
            received: true,
            type: 'daily'
        });
        await userData.save().catch(err => logger.log(err));

        res.status(200).json({
            coins: amount,
            totalCoins: await userData.userCakes.balance
        });
    } catch (error) {
        next(error);
    }
});

router.use(routerManager.errorHandler);

export = router;