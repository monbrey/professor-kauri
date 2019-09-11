import { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler } from "discord-akairo";
import { ClientOptions } from "discord.js";
import queue from "p-queue";
import { join } from "path";
import { ISettings, Settings } from "../models/settings";
import MongooseProvider from "../providers/MongooseProvider";
import Logger from "../util/logger";
import { addTypes } from "./CommandHandler";

declare module "discord-akairo" {
    interface AkairoClient {
        logger: Logger;
        settings: MongooseProvider<ISettings>;
        commandHandler: CommandHandler;
        inhibitorHandler: InhibitorHandler;
        listenerHandler: ListenerHandler;
        reactionQueue: queue;
    }
}

export default class KauriClient extends AkairoClient {
    public settings: MongooseProvider<ISettings>;
    public logger: Logger;
    public reactionQueue: queue;

    public commandHandler: CommandHandler = new CommandHandler(this, {
        argumentDefaults: { prompt: { time: 60000, cancel: "Command cancelled" } },
        directory: join(__dirname, "..", "commands"),
        commandUtil: true,
        commandUtilLifetime: 60000,
        fetchMembers: true,
        handleEdits: true,
        prefix: message => message.guild ? this.settings.get(message.guild.id, "prefix") || "!" : "!",
        storeMessages: true,
    });

    public inhibitorHandler: InhibitorHandler = new InhibitorHandler(this, {
        directory: join(__dirname, "..", "inhibitors"),
    });

    public listenerHandler: ListenerHandler = new ListenerHandler(this, {
        directory: join(__dirname, "..", "listeners"),
    });

    constructor(options: ClientOptions = {}) {
        super({ ownerID: "122157285790187530" }, options);

        this.logger = new Logger(this);
        this.settings = new MongooseProvider(Settings, "guild_id");

        this.reactionQueue = new queue({
            concurrency: 1,
            autoStart: true,
            intervalCap: 1,
            interval: 100
        });
    }

    public async start() {
        await this.init();
        return this.login(process.env.DISCORD_TOKEN).catch(e => this.logger.parseError(e));
    }

    private async init() {
        await this.settings.init();
        await addTypes(this.commandHandler);

        this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
        this.commandHandler.useListenerHandler(this.listenerHandler);

        this.listenerHandler.setEmitters({
            commandHandler: this.commandHandler
        });

        this.commandHandler.loadAll();
        this.inhibitorHandler.loadAll();
        this.listenerHandler.loadAll();
    }
}
