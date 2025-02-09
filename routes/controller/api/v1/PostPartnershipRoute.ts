import { database } from "../../../../client/app";
import RouterUtils from "../../RouterUtils";

export default class PostPartnershipRoute {
    private manager: RouterUtils;

    constructor(route) {
        this.manager = new RouterUtils();
        route.post("/api/v1/servers/:id/partnership", this.manager.isAuthenticated, this.updatePartnership.bind(this));
    }

    async updatePartnership(req, res) {
        const guildId = req.params.id;
        const {
            isPremiumIfBoostedEnabled,
            notifyUserOnPremium,
            serverInvite,
            redeemChannel
        } = req.body;

        console.log(req.body);
        const guildData = await database.getFoxyVerseGuild(guildId);

        if (!guildData) {
            return res.status(404).json({ message: 'Server not registered.' });
        }

        guildData.serverBenefits.givePremiumIfBoosted.isEnabled = !!isPremiumIfBoostedEnabled ? true : false;
        guildData.serverBenefits.givePremiumIfBoosted.notifyUser = !!notifyUserOnPremium ? true : false;
        guildData.serverBenefits.givePremiumIfBoosted.textChannelToRedeem = redeemChannel || guildData.serverBenefits.givePremiumIfBoosted.textChannelToRedeem;
        guildData.serverInvite = serverInvite || guildData.serverInvite;

        await guildData.save();

        res.status(200).redirect(`/br/servers/${guildId}/partnership`);
    }
}