import { ApplicationCommandOptionChoiceData, ApplicationCommandOptionData, ApplicationCommandPermissionData, AutocompleteInteraction, ChatInputApplicationCommandData, CommandInteraction } from 'discord.js';
import { ModelName } from '../../../typings';
import { Module, ModuleOptions } from '../Module';

export interface Command {
	runAutocomplete: (interaction: AutocompleteInteraction<'cached'>, arg: ApplicationCommandOptionChoiceData) => Awaited<void>;
}

export type CommandData = ChatInputApplicationCommandData & {
	defer?: boolean;
	global?: boolean;
	options?: CommandOptionData[];
	permissions?: ApplicationCommandPermissionData[];
};

export type CommandOptionData = ApplicationCommandOptionData & {
	augmentTo?: ModelName;
	options?: CommandOptionData[];
};

export type CommandOptions = CommandData & ModuleOptions;

export abstract class Command extends Module {
	public description: string;
	public defaultPermission: boolean;
	public options: CommandOptionData[];

	public constructor(
		options: CommandOptions
	) {
		super(options.name);

		this.description = options.description;
		this.defaultPermission = options.defaultPermission ?? true;
		this.options = options.options ?? [];
	}

	public abstract runCommand(interaction: CommandInteraction<'cached'>, args?: unknown): Awaited<void>;
}
