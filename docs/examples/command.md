```ts
import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js';
import { ArgumentsOf } from '../../framework/structures/commands/ArgumentsOf';
import { Command } from '../../framework/structures/commands/Command';
import { AugmentationTypes } from '../../typings';

// Command data object
export const data = {		
	// Name must be all lowercase, hyphens and underscores allowed, max 32 chraacters													
	name: '<command_name>',
	// Description of this command, max 100 characters
	description: '<description>',
	// Set the default permission for this command to on (true) or off (false)
	defaultPermission: true
	// Options / arguments for the command
	// Max 25 options
	options: [{
		// Name of the option/argument, max 32 characters
		name: '<option_name>',
		// Description of this option, max 100 characters
		description: '<option description>',
		// Type of the option
		// https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
		type: ApplicationCommandOptionType.String,
		// Enables autocompletion on this option, for strings, numbers and integers
		autocomplete: true,
		// Makes the option required, preventing usage of the command if not provided
		required: true,
		// Defines preset choices on this option, for strings, numbers and integers, max 20
		// Choices are in the format
		choices: [{ name: '<choice_name>', value: '<choice_value>'}]
		// Sub-options if this option is a Subcommand or Subcommand Group
		// Same format as this option
		options: [...],
		// Set the types of Channels allowed for a Channel type option
		channelTypes: [ChannelType.Text],
		// Minimum and maximum values for number or integer type options
		minValue: 0,
		maxValue: 100,
		// Kauri-specific functionality - converts a String argument into a fetched database record
		augmentTo: AugmentationTypes.Ability
	}]
	// Additional Kauri options
	// Wether or not this command should automatically be deferred
	defer: false,
	// Wether or not this command should be globally deployed (available in DMs too)
	global: false,
	// Permissions to set to override the defaultPermission
	permissions: [{
		id: '<user_id>',
		type: ApplicationCommandPermissionType.User,
		permission: true,
	}, {
		id: '<role_id>',
		type: ApplicationCommandPermissionType.Role,
		permission: false,
	}]
} as const;

export default class extends Command {
	// Function to run when a CommandInteraction is recieved
	// (someone submits the command)
	public async runCommand(
		// CommandInteraction object.
		// https://discord.js.org/#/docs/discord.js/main/class/CommandInteraction
		interaction: CommandInteraction<'cached'>,
		// Automatically parsed, type-safe arguments matching the provided options, eg args.option_name	
		args: ArgumentsOf<typeof data>
	) {
		
		await interaction.reply({ content: [args.option_name] });
	}

	// Function to run when an AutocompleteInteraction is recieved
	// (someone is entering an option with autocomplete enabled the command)
	public async runAutocomplete(
		// AutocompleteInteraction object.
		// https://discord.js.org/#/docs/discord.js/main/class/AutocompleteInteraction
		interaction: AutocompleteInteraction<'cached'>,
		// The currently focused argument being input
		arg: ApplicationCommandOptionChoiceData
	) {

		await interaction.respond([{ name: '<choice_name>', value: '<choice_value>'}]);
	}
}
```

### Copyable blank sample with all properties.
* Only `name` and `description` are required on a command.
* Only `name`, `description` and `type` are required on an option.
* Not all properties are compatible with each other.

```ts
import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js';
import { ArgumentsOf } from '../../framework/structures/commands/ArgumentsOf';
import { Command } from '../../framework/structures/commands/Command';
import { AugmentationTypes } from '../../typings';

export const data = {		
	name: '',
	description: '',
	defaultPermission: true
	options: [{
		name: '',
		description: '',
		type: ApplicationCommandOptionType.?,
		autocomplete: true,
		required: true,
		choices: [{ name: '', value: ''}]
		options: []
		channelTypes: [ChannelType.?],
		minValue: 0,
		maxValue: 100,
		augmentTo: AugmentationTypes.?
	}]
	defer: true|false,
	global: true|false,
	permissions: [{
		id: '',
		type: ApplicationCommandPermissionType.?,
		permission: true|false,
	}, {
		id: '',
		type: ApplicationCommandPermissionType.?,
		permission: true|false,
	}]
} as const;

export default class extends Command {
	public async runCommand(interaction: CommandInteraction<'cached'>, args: ArgumentsOf<typeof data>) {

	}

	public async runAutocomplete(interaction: AutocompleteInteraction<'cached'>, arg: ApplicationCommandOptionChoiceData
	) {

	}
}
```

