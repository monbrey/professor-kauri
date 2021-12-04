import type {
	APIApplicationCommandInteraction,
	ApplicationCommandInteractionDataOptionString,
} from "discord-api-types/v9";
import type {
	ChatInputApplicationCommandData,
	CommandInteraction,
	ApplicationCommandOptionData,
} from "discord.js";
import { ModelKey, Awaited } from "../../../typings";
import { KauriClient } from "../KauriClient";
import { KauriHandler } from "../KauriHandler";
import { KauriModule, KauriModuleOptions } from "../KauriModule";

export type CommandData = ChatInputApplicationCommandData & {
	name: string;
	global?: boolean;
	options?: CommandOptionData[];
};

export type CommandOptions = CommandData & KauriModuleOptions;

export type CommandOptionData = ApplicationCommandOptionData & {
	augmentTo?: ModelKey;
	autocomplete?: boolean;
	options?: CommandOptionData[];
};

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

	autocomplete(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		interaction: APIApplicationCommandInteraction,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		option: ApplicationCommandInteractionDataOptionString
	): Awaited<void> {
		throw new Error("This method must be implemented in subclasses");
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	exec(interaction: CommandInteraction, args?: unknown): Awaited<void> {
		throw new Error("This method must be implemented in subclasses");
	}
}
