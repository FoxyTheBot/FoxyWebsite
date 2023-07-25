import mongoose, { ConnectOptions } from 'mongoose';

export default class DatabaseConnection {
    public user: any;
    public commands: any;
    public guilds: any;

    constructor() {
        mongoose.set("strictQuery", true);
        mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        } as ConnectOptions).catch((error) => {
            console.error(error);
        });
        console.info("[DATABASE] - Connected successfully to the database");

       const userSchema = new mongoose.Schema({
            _id: String,
            userCreationTimestamp: Date,
            premium: Boolean,
            premiumDate: Date,
            isBanned: Boolean,
            banData: Date,
            banReason: String,
            aboutme: String,
            balance: Number,
            lastDaily: Date,
            marriedWith: String,
            marriedDate: Date,
            cantMarry: Boolean,
            repCount: Number,
            lastRep: Date,
            background: String,
            backgrounds: Array,
            premiumType: String,
            language: String,
            mask: String,
            masks: Array,
            layout: String
        }, { versionKey: false, id: false });

        const commandsSchema = new mongoose.Schema({
            commandName: String,
            commandUsageCount: Number,
        }, { versionKey: false, id: false });

        const guildSchema = new mongoose.Schema({
            _id: String,
            InviteBlockerModule: {
                isEnabled: Boolean,
                whitelistedInvites: Array,
                whitelistedChannels: Array,
                whitelistedRoles: Array,
                whitelistedUsers: Array,
                blockMessage: String,
            },
            AutoRoleModule: {
                isEnabled: Boolean,
                roles: Array,
            }
        }, { versionKey: false, id: false });
        this.user = mongoose.model('user', userSchema);
        this.commands = mongoose.model('commands', commandsSchema);
        this.guilds = mongoose.model('guilds', guildSchema);
    }

    public async getUser(userId: string): Promise<void> {
        let document = await this.user.findOne({ _id: userId });

        if (!document) {
            document = new this.user({
                _id: userId,
                userCreationTimestamp: Date.now(),
                premium: false,
                premiumDate: null,
                isBanned: false,
                banData: null,
                banReason: null,
                aboutme: null,
                balance: 0,
                lastDaily: null,
                marriedWith: null,
                marriedDate: null,
                cantMarry: false,
                repCount: 0,
                lastRep: null,
                background: "default",
                backgrounds: ["default"],
                premiumType: null,
                language: 'pt-BR',
                mask: null,
                masks: [],
                layout: "default"
            }).save();
        }

        return document;
    }

    public async getAllCommands(): Promise<void> {
        let commandsData = await this.commands.find({});
        return commandsData.map(command => command.toJSON());
    }

    async getAllUsageCount(): Promise<Number> {
        let commandsData = await this.commands.find({});
        let usageCount = 0;
        commandsData.map(command => usageCount += command.commandUsageCount);
        return usageCount;

    }

    async getGuild(guildId: string) {
        let document = await this.guilds.findOne({ _id: guildId });

        if (!document) {
            document = new this.guilds({
                _id: guildId,
                InviteBlockerModule: {
                    isEnabled: false,
                    whitelistedInvites: [],
                    whitelistedChannels: [],
                    whitelistedRoles: [],
                    whitelistedUsers: [],
                    blockMessage: null,
                },
                AutoRoleModule: {
                    isEnabled: false,
                    roles: [],
                }
            }).save();
        }

        return document;
    }
}