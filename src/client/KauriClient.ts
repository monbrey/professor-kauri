// Dependencies
import { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler } from "discord-akairo";
import { ClientOptions, Message } from "discord.js";
import { Connection } from "mongoose";
import queue from "p-queue";
import { join } from "path";
import { UrpgClient } from "urpg.js";
// Models
import { Ability, IAbility } from "../models/ability";
import { IPokemon, Pokemon } from "../models/mongo/pokemon";
import { IMove, Move } from "../models/move";
import { IRoleConfig, RoleConfig } from "../models/roleConfig";
import { ISettings, Settings } from "../models/settings";
import MongooseProvider from "../providers/MongooseProvider";
// Utilities
import { db, instanceDB } from "../util/db";
import Logger from "../util/logger";

interface IKauriClient {
    commandHandler: CommandHandler;
    inhibitorHandler: InhibitorHandler;
    listenerHandler: ListenerHandler;
    reactionQueue: queue;
    logger: Logger;
    settings: MongooseProvider<ISettings>;
    urpgApi: UrpgClient;

    db: {
        main: Connection;
        instance: Connection;
    };
}

declare module "discord-akairo" {
    interface AkairoClient extends IKauriClient { }
}

const PokemonProvider = new MongooseProvider<IPokemon>(Pokemon, "uniqueName");
const AbilityProvider = new MongooseProvider<IAbility>(Ability, "abilityName");
const MoveProvider = new MongooseProvider<IMove>(Move, "moveName");

export default class KauriClient extends AkairoClient {
    public settings: MongooseProvider<ISettings>;
    public roleConfigs: MongooseProvider<IRoleConfig>;
    public logger: Logger;
    public reactionQueue: queue;

    public commandHandler: CommandHandler;
    public inhibitorHandler: InhibitorHandler;
    public listenerHandler: ListenerHandler;

    public urpgApi: UrpgClient;

    constructor(options: ClientOptions = {}) {
        super({ ownerID: "122157285790187530", fetchAllMembers: true }, options);

        this.logger = new Logger(this);
        this.roleConfigs = new MongooseProvider(RoleConfig, "name");
        this.settings = new MongooseProvider(Settings, "guild_id");
        this.urpgApi = new UrpgClient({ castToNull: true });

        this.db = {
            main: db,
            instance: instanceDB
        };

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
                phrase = phrase.replace(/-G$/gi, "-Galar").replace(/-A/gi, "-Alola");
                return PokemonProvider.resolveClosest(phrase);
            })
            .addType("api-pokemon", async (message: Message, phrase: string) => {
                if (!phrase) return;

                phrase = phrase.replace(/-G$/gi, "-Galar").replace(/-A/gi, "-Alola");
                const response = await this.urpgApi.pokemon.getClosest(phrase);
                if (response) return response;
            })
            .addType("pokemonTeam", (message: Message, phrase: string) => {
                if (!phrase) return;
                return Promise.all(phrase.split(/,\s+?/).map(p => PokemonProvider.resolveClosest(p)));
            })
            .addType("ability", (message: Message, phrase: string) => {
                if (!phrase) return;
                return AbilityProvider.fetchClosest(phrase);
            })
            .addType("move", (message: Message, phrase: string) => {
                if (!phrase) return;
                return MoveProvider.fetchClosest(phrase);
            })
            .addType("roleConfig", (message: Message, phrase: string) => {
                if (!phrase) return;
                return this.roleConfigs.fetchClosest(phrase);
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
        await this.roleConfigs.init();

        this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
        this.commandHandler.useListenerHandler(this.listenerHandler);

        this.listenerHandler.setEmitters({
            commandHandler: this.commandHandler
        });

        this.commandHandler.loadAll();
        this.inhibitorHandler.loadAll();
        this.listenerHandler.loadAll();
    }

    public getTypeEmoji(type?: string, reverse: boolean = false) {
        if (!type) return;
        return this.emojis.find(x => x.name === `type_${type.toLowerCase()}${reverse ? "_rev" : ""}`);
    }
}
