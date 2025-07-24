export const constants = {
    INVITE_BOT: (guildId: string) => `https://discord.com/oauth2/authorize?client_id=1006520438865801296&scope=bot+applications.commands&permissions=269872255&guild_id=${guildId}`,

    /* Discord API */

    USER_GUILDS: "https://discord.com/api/users/@me/guilds",
    GUILD_CHANNELS: (guildId: string) => `https://discord.com/api/guilds/${guildId}/channels`,
    USER_AVATAR: (userId: string, avatar: string) => `https://cdn.discordapp.com/avatars/${userId}/${avatar}.png`,

    /* Redirects */

    DASHBOARD: "/br/dashboard",
    SERVER_MODULES: (guildId: string, module: string) => `/br/servers/${guildId}/${module}`,
    SERVER_SETTINGS: (guildId: string) => `/br/servers/${guildId}/general`,
    USER_DECORATIONS: "/br/user/decorations",
    USER_STORE: "/br/store",

    /* FoxPayments endpoints */

    CHECKOUT: (checkoutId: string) => `${process.env.FP_URL}checkout/id/${checkoutId}`,

    /* Additional Redirects */

    DISCORD_OAUTH_URL: 'https://discord.com/oauth2/authorize?client_id=1006520438865801296&permissions=269872255&response_type=code&redirect_uri=https%3A%2F%2Ffoxybot.xyz%2Flogin%2Fcallback&integration_type=0&scope=guilds+bot+applications.commands+email+identify',
    GITHUB_URL: 'https://github.com/FoxyTheBot/Foxy',
    DISCORD_SERVER_URL: 'https://discord.gg/6mG2xDtuZD',
    PRIVACY_POLICY_URL: 'https://foxybot.xyz/br/support/terms',
    TRANSLATE_URL: 'https://translate.foxybot.xyz',
    STATUS_PAGE_URL: 'https://foxybot.statuspage.io/',
    UPVOTE_URL: 'https://top.gg/bot/1006520438865801296',
    EXITLAG_URL: "https://www.exitlag.com/aff.php?aff=10102649"
}