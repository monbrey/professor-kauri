import { AutocompleteInteraction, CommandInteraction, CommandInteractionOption } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { Pokemon } from "../../framework/models";
import { ArgumentsOf } from "../../framework/structures/commands/ArgumentsOf";
import { Command } from "../../framework/structures/commands/Command";
import { AugmentationTypes } from "../../typings";

export const data = {
	name: "dex",
	description: "Get Ultradex data for a Pokemon",
	options: [
		{
			name: "species",
			description: "Pokemon species to search for",
			type: ApplicationCommandOptionTypes.STRING,
			augmentTo: AugmentationTypes.Pokemon,
			required: true,
			autocomplete: true,
			choices: [],
		},
	],
	global: true,
} as const;

export default class DexCommand extends Command {
	public async autocomplete(interaction: AutocompleteInteraction, arg: CommandInteractionOption): Promise<void> {
		if (typeof arg.value !== "string") {
			return;
		}

		const list = await Pokemon.search(this.client, arg.value);
		const choices = list.filter(x => x.rating >= 0.5).map(x => ({ name: x.target, value: x.target }));

		await interaction.respond(choices);
	}

	public async exec(interaction: CommandInteraction, args: ArgumentsOf<typeof data>): Promise<void> {
		await interaction.reply({ embeds: [args.species.dex(this.client)] });
		this.client.logger.info({ command: "dex", value: args.species.name });
	}
}
