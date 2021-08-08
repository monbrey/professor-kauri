import { ArgumentsOf, AugmentationTypes, Command, CommandOptionTypes } from "@professor-kauri/framework";
import type { CommandInteraction } from "discord.js";

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
		},
	],
} as const;

export default class DexCommand extends Command {
	public async exec(interaction: CommandInteraction, args: ArgumentsOf<typeof data>): Promise<void> {
		// this.client.logger.info({
		//   key: interaction.commandName,
		//   query: species,
		//   result: pokemon.name,
		// });

		await interaction.reply({ embeds: [args.species.dex(this.client)] });
	}
}