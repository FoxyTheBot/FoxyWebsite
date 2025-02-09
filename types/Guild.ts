export interface FoxyGuild {
    _id: string;
    AutoRoleModule: AutoRoleModule;
    premiumKeys: string[];
    GuildJoinLeaveModule: WelcomerModule;
    guildSettings: guildSettings;
    antiRaidModule: AntiRaidModule;
    dashboardLogs: dashboardLogs[];
    guildAddedAt: BigInt;
    save?: () => any;
}

interface AutoRoleModule {
    isEnabled: boolean;
    roles: string[];
}

interface AntiRaidModule {
    handleMultipleMessages: boolean;
    handleMultipleJoins: boolean;
    handleMultipleChars: boolean;
    messagesThreshold: number;
    newUsersThreshold: number;
    repeatedCharsThreshold: number;
    warnsThreshold: number;
    alertChannel: string | null;
    actionForMassJoin: string;
    actionForMassMessage: string;
    actionForMassChars: string;
    timeoutDuration: number;
    whitelistedChannels: string[];
    whitelistedRoles: string[];
}

interface WelcomerModule {
    isEnabled: boolean;
    joinMessage: string;
    alertWhenUserLeaves: boolean;
    leaveMessage: string;
    joinChannel: string;
    leaveChannel: string;
}

interface guildSettings {
    prefix: string;
    disabledCommands: string[];
    blockedChannels: string[];
    sendMessageIfChannelIsBlocked: boolean;
    deleteMessageIfCommandIsExecuted: boolean;
    usersWhoCanAccessDashboard: string[];
}

interface dashboardLogs {
    authorId: string;
    actionType: string;
    date: BigInt;
}