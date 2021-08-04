import type { KauriClient, KauriHandler } from "@professor-kauri/framework";
import type { ApplicationCommandData, ApplicationCommandOptionData, Awaited, CommandInteraction } from "discord.js";
import type { ModelKey } from "../../typings";
import { KauriModule, KauriModuleOptions } from "../KauriModule";

export interface CommandData extends ApplicationCommandData {
	name: string;
	global?: boolean;
	options?: CommandOptionData[];
}

export type CommandOptions = CommandData & KauriModuleOptions;

export interface CommandOptionData extends ApplicationCommandOptionData {
	augmentTo?: ModelKey;
}

export class Command extends KauriModule {
	public client!: KauriClient;
	public handler!: KauriHandler;

	public name: string;
	public description: string;
	public global: boolean;
	public defaultPermission: boolean;
	public options: CommandOptionData[];

	public constructor(options: CommandOptions) {
		super(options);

		this.name = options.name;
		this.description = options.description;
		this.defaultPermission = options.defaultPermission ?? true;
		this.options = options.options ?? [];
		this.global = options.global ?? false;
	}

	reload(): void | KauriModule {
		throw new Error("Method not implemented.");
	}
	remove(): void | KauriModule {
		throw new Error("Method not implemented.");
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	exec(interaction: CommandInteraction, args?: unknown): Awaited<void> {
		throw new Error("This method must be implemented in subclasses");
	}
}
