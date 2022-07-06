const Discord = require("discord.js");
const Logger = require("rf-logger");
const logger = new Logger("rf-discord-webhook-sender")



function DiscordHook(img) {
    this.send = (data) => {
        const hook = new Discord.WebhookClient({ url: "https://discord.com/api/webhooks/987718761589112842/Ocxl06qmXL3k8_00cywTVbCx26pEOZ9KPGSqYpe3XpjqvI2SzQIKCbqUuvLlUeirZVTo" });
        return hook.send(img.url).catch(err => { throw err })
    }
};

module.exports = DiscordHook