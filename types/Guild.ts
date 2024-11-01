export interface FoxyGuild {
    _id: string;
    AutoRoleModule: AutoRoleModule;
    premiumKeys: string[];
    GuildJoinLeaveModule: WelcomerModule;
    guildSettings: guildSettings;
    dashboardLogs: dashboardLogs[];

    save?: () => any;
}

interface AutoRoleModule {
    isEnabled: boolean;
    roles: string[];
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
    _id: string;
    user: string;
    action: string;
    date: Date;
}