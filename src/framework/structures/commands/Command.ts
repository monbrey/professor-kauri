import type {
	ApplicationCommandOptionData,
	ApplicationCommandPermissionData,
	AutocompleteInteraction, ChatInputApplicationCommandData,
	CommandInteraction,
	CommandInteractionOption,
} from "discord.js";
import { Awaited, ModelKey } from "../../../typings";
import { DefaultPermissions } from "../../util/Constants";
import { KauriClient } from "../KauriClient";
import { KauriHandler } from "../KauriHandler";
import { KauriModule, KauriModuleOptions } from "../KauriModule";

export type CommandData = ChatInputApplicationCommandData & {
	name: string;
	global?: boolean;
	options?: CommandOptionData[];
	permissions?: ApplicationCommandPermissionData[];
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
	public permissions: ApplicationCommandPermissionData[];

	public constructor(options: CommandOptions) {
		super(options);

		this.name = options.name;
		this.description = options.description;
		this.defaultPermission = options.defaultPermission ?? true;
		this.options = options.options ?? [];
		this.global = options.global ?? false;
		this.permissions = [...DefaultPermissions, ...(options.permissions || [])];
	}

	reload(): void | KauriModule {
		throw new Error("Method not implemented.");
	}
	remove(): void | KauriModule {
		throw new Error("Method not implemented.");
	}

	autocomplete(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		interaction: AutocompleteInteraction<"cached">,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		args: CommandInteractionOption<"cached">
	): Awaited<void> {
		throw new Error("This method must be implemented in subclasses");
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	exec(interaction: CommandInteraction<"cached">, args?: unknown): Awaited<void> {
		throw new Error("This method must be implemented in subclasses");
	}
}
