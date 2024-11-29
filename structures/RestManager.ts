import { BigString, createBotConstants, createRestManager, Guild } from "discordeno";
import { logger } from "./logger";

export default class RestManager {
    public rest = createRestManager({
        // @ts-ignore
        token: process.env.BOT_TOKEN,
        version: 10,
    });
    public constants = createBotConstants();

    async getUser(userId: string) {
        return await this.rest.runMethod(this.rest, "GET", this.constants.routes.USER(userId));
    }

    async sendDirectMessage(userId: BigString, data: Object) {
        try {
            const userDM: any = this.rest.runMethod(this.rest, "POST", this.constants.routes.USER_DM(), {
                recipient_id: userId,
            });
    
            return this.rest.runMethod(this.rest, "POST", this.constants.routes.CHANNEL_MESSAGES((await userDM).id), {
                ...data
            });
        } catch (error) {
            logger.error("Error sending direct message to user. Is DM closed?", error)
        }
    }

    async getGuild(guildId: string): Promise<Guild> {
        return await this.rest.runMethod(this.rest, "GET", this.constants.routes.GUILD(guildId));
    }

    async sendMessageToAChannelAsJSON(channelId: string, content: string) {
        let jsonContent;

        try {
            jsonContent = JSON.parse(content);
        } catch (error) {
            console.warn("Failed to parse JSON, sending as string:", error);
            jsonContent = { content };
        }

        const filteredContent: any = {
            content: jsonContent.content || null,
            embeds: jsonContent.embeds || [],
            components: jsonContent.components || [],
        };

        try {
            return await this.rest.runMethod(
                this.rest,
                "POST",
                this.constants.routes.CHANNEL_MESSAGES(channelId),
                filteredContent
            );
        } catch (error) {
            console.error("Failed to send message:", error);
            throw new Error("Message sending failed: " + error);
        }
    }

    private normalizeComponents(components: any[]): any[] {
        return components.map(componentGroup => ({
            type: 1,
            components: componentGroup.components.map((component: any) => {
                if (component.type !== 2) {
                    logger.warn(`Component '${component.label}' is not a button. Removing.`);
                    return null;
                }
                if (component.type === 2 && component.style !== 5) {
                    logger.warn(`Button '${component.label}' has incorrect style. Setting to 'style: 5' (link).`);
                    return { ...component, style: 5 };
                }
                return component;
            })
        }));
    }
}