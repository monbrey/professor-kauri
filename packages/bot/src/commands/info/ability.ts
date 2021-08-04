import { ArgumentsOf, AugmentationTypes, Command, CommandOptionTypes } from "@professor-kauri/framework";
import type { CommandInteraction } from "discord.js";

export const data = {
	name: "ability",
	description: "Get Infohub data for an ability",
	options: [
		{
			name: "ability",
			description: "Name of the ability to search for",
			type: CommandOptionTypes.String,
			augmentTo: AugmentationTypes.Ability,
			required: true,
		},
	],
} as const;

export default class AbilityCommand extends Command {
	public async exec(interaction: CommandInteraction, args: ArgumentsOf<typeof data>): Promise<void> {
		await interaction.reply({ embeds: [args.ability.info()] });
	}
}
