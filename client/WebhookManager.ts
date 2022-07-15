import { WebhookClient, MessageEmbed } from 'discord.js';

export function sendReport(data: any, body: any) {
    var type = body.type;
    var webhook;
    if (type === 'suggestion') {
        webhook = new WebhookClient({ url: process.env.SUGGESTION });
    } else if (type === 'report') {
        webhook = new WebhookClient({ url: process.env.REPORT });
    }
    const embed = new MessageEmbed()
        .addFields(
            { name: '💁‍♀️ | Usuário', value: `\`${data.username}#${data.discriminator} / ${data.id}\`` },
            { name: '✨ | Conteúdo', value: body.content }
        )
    return webhook.send({
        username: data.username,
        embeds: [embed]
    })
}