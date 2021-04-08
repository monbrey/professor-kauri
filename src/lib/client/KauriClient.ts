// Dependencies
import { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler } from "discord-akairo";
import { ClientOptions, Collection, Message, Role } from "discord.js";
import { Connection } from "mongoose";
import queue from "p-queue";
import { join } from "path";
import { Client as UrpgClient } from "urpg.js";
import { RoleConfig } from "../../models/mongo/roleConfig";
import { ISettings, Settings } from "../../models/mongo/settings";
// Utilities
import { db, instanceDB } from "../../util/db";
import Logger from "../../util/logger";
import { InteractionHandler } from "../commands/InteractionHandler";

interface IKauriClient {
  commandHandler: CommandHandler;
  inhibitorHandler: InhibitorHandler;
  listenerHandler: ListenerHandler;
  logger: Logger;
  prefix: string;
  reactionQueue: queue;
  settings?: Collection<string, ISettings>;
  urpg: UrpgClient;

  db: {
    main: Connection;
    instance: Connection;
  };
}

declare module "discord.js" {
  interface Client extends IKauriClient { }
}

export class KauriClient extends AkairoClient {
  public logger: Logger;
  public reactionQueue: queue;
  public settings?: Collection<string, ISettings>;

  public commandHandler: CommandHandler;
  public interactionHandler: InteractionHandler;
  public inhibitorHandler: InhibitorHandler;
  public listenerHandler: ListenerHandler;

  public urpg: UrpgClient;

  constructor(options: ClientOptions) {
    super({ ...options, ownerID: "122157285790187530" }, options);

    this.logger = new Logger(this);
    this.urpg = new UrpgClient({ nullHandling: true });

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
      directory: join(__dirname, "..", "..", "commands"),
      commandUtil: true,
      commandUtilLifetime: 60000,
      fetchMembers: true,
      handleEdits: true,
      prefix: "!",
      storeMessages: true,
    });

    this.commandHandler.resolver
      .addType("ability", async (message: Message, phrase: string) => {
        if (!phrase) return;
        const response = await this.urpg.ability.fetchClosest(phrase);
        if (response) return response;
      })
      .addType("attack", async (message: Message, phrase: string) => {
        if (!phrase) return;
        const response = await this.urpg.attack.fetchClosest(phrase);
        if (response) return response;
      })
      .addType("pokemon", async (message: Message, phrase: string) => {
        if (!phrase) return;

        phrase = phrase.replace(/-G$/gi, "-Galar").replace(/-A/gi, "-Alola");
        const response = await this.urpg.species.fetchClosest(phrase);
        if (response) return response;
      })
      .addType("pokemonTeam", (message: Message, phrase: string) => {
        if (!phrase) return;
        return phrase.split(/,\s+?/).map(p => this.commandHandler.resolver.type("pokemon")(message, phrase));
      })
      .addType("roleConfig", async (message: Message, phrase: string | Role) => {
        if (!phrase) return;
        return typeof phrase === "string" ? RoleConfig.findClosest("name", phrase) : RoleConfig.findOne({ role_id: phrase.id });
      });

    this.interactionHandler = new InteractionHandler(this, {
      directory: join(__dirname, "..", "..", "interactions")
    });

    this.inhibitorHandler = new InhibitorHandler(this, {
      directory: join(__dirname, "..", "..", "inhibitors"),
    });

    this.listenerHandler = new ListenerHandler(this, {
      directory: join(__dirname, "..", "..", "listeners"),
    });
  }

  public async start() {
    await this.init();
    return this.login(process.env.KAURI_TOKEN).catch(e => this.logger.parseError(e));
  }

  private async init() {
    this.settings = new Collection((await Settings.find()).map(s => [s.guild_id, s]));

    this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
    this.commandHandler.useListenerHandler(this.listenerHandler);

    this.listenerHandler.setEmitters({
      commandHandler: this.commandHandler,
      websocket: this.ws
    });

    this.commandHandler.loadAll();
    this.inhibitorHandler.loadAll();
    this.listenerHandler.loadAll();
  }

  public getTypeEmoji(type?: string, reverse: boolean = false) {
    if (!type) return;
    return this.emojis.cache.find(x => x.name === `type_${type.toLowerCase()}${reverse ? "_rev" : ""}`);
  }
}
