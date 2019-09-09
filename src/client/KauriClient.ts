import { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler } from "discord-akairo";
import { ClientOptions } from "discord.js";
import mongoose from "mongoose";
import queue from "p-queue";
import { join } from "path";
import { ISettings, Settings } from "../models/settings";
import MongooseProvider from "../providers/MongooseProvider";
import Logger from "../util/logger";
import { buildCommandHandler } from "./CommandHandler";

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

    public commandHandler: CommandHandler = buildCommandHandler(this);

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
