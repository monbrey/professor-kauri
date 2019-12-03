import { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler } from "discord-akairo";
import { ClientOptions, Message } from "discord.js";
import queue from "p-queue";
import { join } from "path";
import { Ability, IAbility } from "../models/ability";
import { IMove, Move } from "../models/move";
import { IPokemon, Pokemon } from "../models/pokemon";
import { ISettings, Settings } from "../models/settings";
import MongooseProvider from "../providers/MongooseProvider";
import Logger from "../util/logger";
import { UrpgClient } from "urpg.js";

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

const Provider = {
    Pokemon: new MongooseProvider<IPokemon>(Pokemon, "uniqueName"),
    Ability: new MongooseProvider<IAbility>(Ability, "abilityName"),
    Move: new MongooseProvider<IMove>(Move, "moveName")
};

export default class KauriClient extends AkairoClient {
    public settings: MongooseProvider<ISettings>;
    public logger: Logger;
    public reactionQueue: queue;

    public commandHandler: CommandHandler;
    public inhibitorHandler: InhibitorHandler;
    public listenerHandler: ListenerHandler;

    public urpgApi: UrpgClient;

    constructor(options: ClientOptions = {}) {
        super({ ownerID: "122157285790187530" }, options);

        this.logger = new Logger(this);
        this.settings = new MongooseProvider(Settings, "guild_id");
        this.urpgApi = new UrpgClient();

        this.reactionQueue = new queue({
            concurrency: 1,
            autoStart: true,
            intervalCap: 1,
            interval: 100
        });

        this.commandHandler = new CommandHandler(this, {
            argumentDefaults: { prompt: { time: 60000, cancel: "Command cancelled" } },
            directory: join(__dirname, "..", "commands"),
            commandUtil: true,
            commandUtilLifetime: 60000,
            fetchMembers: true,
            handleEdits: true,
            prefix: message => message.guild ? this.settings.get(message.guild.id, "prefix") || "!" : "!",
            storeMessages: true,
        });

        this.commandHandler.resolver
            .addType("pokemon", (message: Message, phrase: string) => {
                if (!phrase) return;
                return Provider.Pokemon.resolveClosest(phrase);
            })
            .addType("api-pokemon", async (message: Message, phrase: string) => {
                if (!phrase) return;

                const response = await this.urpgApi.pokemon.getClosest(phrase);
                if (response) return response.value;
            })
            .addType("pokemonTeam", (message: Message, phrase: string) => {
                if (!phrase) return;
                return Promise.all(phrase.split(/,\s+?/).map(p => Provider.Pokemon.resolveClosest(p)));
            })
            .addType("ability", (message: Message, phrase: string) => {
                if (!phrase) return;
                return Provider.Ability.fetchClosest(phrase);
            })
            .addType("move", (message: Message, phrase: string) => {
                if (!phrase) return;
                return Provider.Move.fetchClosest(phrase);
            });

        this.inhibitorHandler = new InhibitorHandler(this, {
            directory: join(__dirname, "..", "inhibitors"),
        });

        this.listenerHandler = new ListenerHandler(this, {
            directory: join(__dirname, "..", "listeners"),
        });
    }

    public async start() {
        await this.init();
        return this.login(process.env.KAURI_TOKEN).catch(e => this.logger.parseError(e));
    }

    private async init() {
        await this.settings.init();

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
