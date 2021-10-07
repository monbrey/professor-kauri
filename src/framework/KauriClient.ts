import type { GuildEmoji } from "discord.js";
import { Client as DiscordClient, ClientOptions } from "discord.js";
import type { Db } from "mongodb";
import { Client as UrpgClient } from "urpg.js";
import { CommandHandler } from "./structures/commands/CommandHandler";
import { EventHandler } from "./structures/events/EventHandler";
import { Database } from "./util/Database";

declare module "discord.js" {
	interface Client {
		commands: CommandHandler;
		events: EventHandler;
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
	public urpg: UrpgClient;

	constructor(options: KauriOptions) {
		super(options);

		this.commands = new CommandHandler(this, {
			directory: options.commandDirectory,
		});

		this.events = new EventHandler(this, {
			directory: options.eventDirectory,
		});

		this.urpg = new UrpgClient({
			nullHandling: true,
		});
	}

	public getDatabase(): Promise<Db> {
		return Database.getDb();
	}

	public async start(options?: KauriStartOptions): Promise<void> {
		await Database.connect(options?.mongoUri);
		this.commands.loadAll();
		this.events.loadAll();
		await this.login(options?.token);
	}

	public getTypeEmoji(type?: string, reverse = false): GuildEmoji | null {
		if (!type) return null;
		return this.emojis.cache.find(x => x.name === `type_${type.toLowerCase()}${reverse ? "_rev" : ""}`) ?? null;
	}
}
