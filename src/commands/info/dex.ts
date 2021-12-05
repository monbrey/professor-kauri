import { AutocompleteInteraction, CommandInteraction, CommandInteractionOption } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { DateTime } from "luxon";
import { findBestMatch } from "string-similarity";
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
		},
	],
	global: true,
} as const;

export default class DexCommand extends Command {
	private list?: string[];
	private listLastFetched?: DateTime;

	public async autocomplete(interaction: AutocompleteInteraction, arg: CommandInteractionOption): Promise<void> {
		if (typeof arg.value !== "string") {
			return;
		}

		if (!this.list || !this.listLastFetched || this.listLastFetched < DateTime.now().minus({ days: 1 })) {
			this.list = await this.client.urpg.species.list();
			this.listLastFetched = DateTime.now();
		}

		const { ratings } = findBestMatch(arg.value, this.list);
		const choices = ratings
			.sort((a, b) => b.rating - a.rating).slice(0, 10)
			.map(l => ({ name: l.target, value: l.target }));

		await interaction.respond(choices);
	}

	public async exec(interaction: CommandInteraction, args: ArgumentsOf<typeof data>): Promise<void> {
		// this.client.logger.info({
		//   key: interaction.commandName,
		//   query: species,
		//   result: pokemon.name,
		// });

		console.log(args.species);

		await interaction.reply({ embeds: [args.species.dex(this.client)] });
		this.client.logger.info({ command: "dex", value: args.species.name });
	}
}
