import mongoose from 'mongoose';

/* User related schemas */
const keySchema = new mongoose.Schema({
    key: String,
    used: Boolean,
    expiresAt: Date,
    pType: Number,
    guild: String,
}, { versionKey: false, id: false });
const transactionSchema = new mongoose.Schema({
    to: String,
    from: String,
    quantity: Number,
    date: Date,
    received: Boolean,
    type: String
}, {
    versionKey: false, id: false
});
const petSchema = new mongoose.Schema({
    name: String,
    type: String,
    rarity: String,
    level: Number,
    hungry: Number,
    happy: Number,
    health: Number,
    lastHungry: Date,
    lastHappy: Date,
    isDead: Boolean,
    isClean: Boolean,
    food: Array
}, { versionKey: false, id: false });

const userSchema = new mongoose.Schema({
    _id: String,
    userCreationTimestamp: Date,
    isBanned: Boolean,
    banDate: Date,
    banReason: String,
    userCakes: {
        balance: Number,
        lastDaily: Date,
    },
    marryStatus: {
        marriedWith: String,
        marriedDate: Date,
        cantMarry: Boolean,
    },
    userProfile: {
        decoration: String,
        decorationList: Array,
        background: String,
        backgroundList: Array,
        repCount: Number,
        lastRep: Date,
        layout: String,
        layoutList: Array,
        aboutme: String,
    },
    userPremium: {
        premium: Boolean,
        premiumDate: Date,
        premiumType: String,
    },
    userSettings: {
        language: String
    },
    petInfo: petSchema,
    userTransactions: [transactionSchema],
    riotAccount: {
        isLinked: Boolean,
        puuid: String,
        isPrivate: Boolean,
        region: String
    },
    premiumKeys: [keySchema],
    roulette: {
        availableSpins: Number,
    },
    lastVote: Date,
    voteCount: Number,
    notifiedForVote: Boolean,
}, { versionKey: false, id: false });

const riotAccountSchema = new mongoose.Schema({
    puuid: String,
    authCode: String,
});

/* End of user related schemas */

/* Guild related schemas */
const keySchemaForGuilds = new mongoose.Schema({
    key: String,
    used: Boolean,
    expiresAt: Date,
    pType: Number,
    guild: String,
    owner: String,
}, {
    versionKey: false, id: false
});

const dashboardLogsSchema = new mongoose.Schema({
    authorId: String,
    actionType: String,
    date: {
        type: mongoose.Schema.Types.BigInt,
        get: (value: BigInt) => Number(value),
        set: (value: any) => BigInt(value)
    }
}, { versionKey: false, id: false, _id: false });

dashboardLogsSchema.set('toJSON', {
    transform: (doc: any, ret: any) => {
      if (ret.date && typeof ret.date === 'bigint') {
        ret.date = Number(ret.date);
      }
      return ret;
    }
  });

  
const guildSchema = new mongoose.Schema({
    _id: String,
    guildAddedAt: {
        type: mongoose.Schema.Types.BigInt,
        get: (value: BigInt) => Number(value),
        set: (value: any) => BigInt(value)
    },
    GuildJoinLeaveModule: {
        isEnabled: Boolean,
        joinMessage: String,
        alertWhenUserLeaves: Boolean,
        leaveMessage: String,
        joinChannel: String,
        leaveChannel: String,
    },
    AutoRoleModule: {
        isEnabled: Boolean,
        roles: Array,
    },
    premiumKeys: [keySchemaForGuilds],
    guildSettings: {
        prefix: String,
        disabledCommands: Array,
        blockedChannels: Array,
        sendMessageIfChannelIsBlocked: Boolean,
        deleteMessageIfCommandIsExecuted: Boolean,
        usersWhoCanAccessDashboard: Array,
    },
    antiRaidModule: {
        handleMultipleMessages: Boolean,
        handleMultipleJoins: Boolean,
        handleMultipleChars: Boolean,
        messagesThreshold: {
            type: mongoose.Schema.Types.Number,
            default: 8,
        },
        newUsersThreshold: {
            type: mongoose.Schema.Types.Number,
            default: 5,
        },
        repeatedCharsThreshold: {
            type: mongoose.Schema.Types.Number,
            default: 10,
        },
        warnsThreshold: {
            type: mongoose.Schema.Types.Number,
            default: 3,
        },
        alertChannel: String || null,
        actionForMassJoin: String || "NOTHING",
        actionForMassMessage: String || "TIMEOUT",
        actionForMassChars: String || "WARN",
        timeoutDuration: {
            type: mongoose.Schema.Types.Number,
            default: 10000,
        },
        whitelistedChannels: Array,
        whitelistedRoles: Array,
    },
    dashboardLogs: [dashboardLogsSchema],
}, { versionKey: false, id: false });

/* End of guild related schemas */

/* Bot related schemas */

const foxyVerseSchema = new mongoose.Schema({
    _id: String,
    serverBenefits: {
        givePremiumIfBoosted: {
            isEnabled: Boolean,
            notifyUser: Boolean,
            textChannelToRedeem: String,
        },
    },
    guildAdmins: Array,
    serverInvite: String,

}, { versionKey: false, id: false, _id: false });

const commandsSchema = new mongoose.Schema({
    commandName: String,
    commandUsageCount: Number,
    category: String,
    description: String,
    isInactive: Boolean,
    supportsLegacy: Boolean,
    subcommands: Array,
    usage: Array
}, { versionKey: false, id: false });

const itemSchema = new mongoose.Schema({
    id: String,
    type: String,
});

const dailyStoreSchema = new mongoose.Schema({
    itens: [itemSchema],
    lastUpdate: Date,
}, { versionKey: false, id: false });

const backgroundSchema = new mongoose.Schema({
    id: String,
    name: String,
    cakes: Number,
    filename: String,
    description: String,
    author: String,
    inactive: Boolean,
    releaseDate: Date,
    limitedEdition: Boolean,
    rarity: String,
    collection: String,
}, { versionKey: false, id: false, suppressReservedKeysWarning: true });

const layoutSchema = new mongoose.Schema({
    id: String,
    name: String,
    filename: String,
    description: String,
    cakes: Number,
    inactive: Boolean,
    author: String,
    darkText: Boolean,
}, { versionKey: false, id: false });

const avatarDecorationSchema = new mongoose.Schema({
    id: String,
    name: String,
    cakes: Number,
    filename: String,
    description: String,
    inactive: Boolean,
    author: String,
    isMask: Boolean,
}, { versionKey: false, id: false });

const storeSchema = new mongoose.Schema({
    itemId: String,
    itemName: String,
    price: Number,
    description: String,
    isSubscription: Boolean,
    quantity: Number,
});

const checkoutList = new mongoose.Schema({
    checkoutId: String,
    userId: String,
    itemId: String,
    date: Date,
    isApproved: Boolean,
    paymentId: String,
}, { versionKey: false, id: false });

const badgesSchema = new mongoose.Schema({
    id: String,
    name: String,
    asset: String,
    description: String,
    exclusive: Boolean,
    priority: Number,
    isFromGuild: String,
});

export const Schemas = {
    userSchema,
    guildSchema,
    commandsSchema,
    backgroundSchema,
    riotAccountSchema,
    keySchema,
    layoutSchema,
    avatarDecorationSchema,
    storeSchema,
    checkoutList,
    dailyStoreSchema,
    badgesSchema,
    foxyVerseSchema
};

/* End of bot related schemas */