import { ArgumentsOf, AugmentationTypes, Command, CommandOptionTypes } from "@professor-kauri/framework";
import type {
	APIApplicationCommandInteraction,
	ApplicationCommandInteractionDataOptionString,
} from "discord-api-types/v9";
import type { CommandInteraction } from "discord.js";
import { DateTime } from "luxon";
import { findBestMatch } from "string-similarity";

export const data = {
	name: "dex",
	description: "Get Ultradex data for a Pokemon",
	options: [
		{
			name: "species",
			description: "Pokemon species to search for",
			type: CommandOptionTypes.String,
			augmentTo: AugmentationTypes.Pokemon,
			required: true,
			autocomplete: true,
		},
	],
} as const;

export default class DexCommand extends Command {
	private list?: string[];
	private listLastFetched?: DateTime;

	public async autocomplete(
		interaction: APIApplicationCommandInteraction,
		option: ApplicationCommandInteractionDataOptionString
	): Promise<void> {
		if (!this.list || !this.listLastFetched || this.listLastFetched < DateTime.now().minus({ days: 1 })) {
			this.list = await this.client.urpg.species.list();
			this.listLastFetched = DateTime.now();
		}

		const { ratings } = findBestMatch(option.value, this.list);
		const choices = ratings
			.sort((a, b) => b.rating - a.rating).slice(0, 10)
			.map(l => ({ name: l.target, value: l.target }));

		// @ts-expect-error API is privately typed
		await this.client.api.interactions(interaction.id, interaction.token).callback.post({
			data: {
				type: 8,
				data: {
					choices,
				},
			},
		});
	}

	public async exec(interaction: CommandInteraction, args: ArgumentsOf<typeof data>): Promise<void> {
		// this.client.logger.info({
		//   key: interaction.commandName,
		//   query: species,
		//   result: pokemon.name,
		// });

		await interaction.reply({ embeds: [args.species.dex(this.client)] });
	}
}
