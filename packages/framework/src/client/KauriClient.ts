import { Database } from "@professor-kauri/database";
import { Client as DiscordClient, ClientOptions } from "discord.js";
import type { Db } from "mongodb";
import { CommandHandler } from "../structures/commands/CommandHandler";
import { EventHandler } from "../structures/events/EventHandler";
declare module "discord.js" {
  interface Client {
    commands: CommandHandler;
  }
}

export interface KauriOptions extends ClientOptions {
  commandDirectory: string;
  eventDirectory: string;
}

export interface KauriStartOptions {
  mongoUri?: string;
  token?: string;
}

export class KauriClient extends DiscordClient {
  public commands: CommandHandler;
  public events: EventHandler;
  public db: Db | null = null;

  constructor(options: KauriOptions) {
    super(options);

    this.commands = new CommandHandler(this, {
      directory: options.commandDirectory,
    });

    this.events = new EventHandler(this, {
      directory: options.eventDirectory,
    });
  }

  public async start(options?: KauriStartOptions): Promise<void> {
    this.db = await Database.connect(options?.mongoUri);
    this.commands.loadAll();
    this.events.loadAll();
    await this.login(options?.token);
  }
}
