import type { CommandInteraction } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { ArgumentsOf } from "../../framework/structures/commands/ArgumentsOf";
import { Command } from "../../framework/structures/commands/Command";
import { AugmentationTypes } from "../../typings";

export const data = {
	name: "learnset",
	description: "Get the movelist for a Pokemon",
	options: [
		{
			name: "species",
			description: "Pokemon species to search for",
			type: ApplicationCommandOptionTypes.STRING,
			augmentTo: AugmentationTypes.Pokemon,
			required: true,
		},
	],
	global: true,
} as const;

export default class LearnsetCommand extends Command {
	public async exec(interaction: CommandInteraction, args: ArgumentsOf<typeof data>): Promise<void> {
		// this.client.logger.info({
		//   key: interaction.commandName,
		//   query: species,
		//   result: pokemon.name,
		// });

		await interaction.reply({ embeds: [args.species.learnset()] });
	}
}
