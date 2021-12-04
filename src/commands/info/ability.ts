import type { CommandInteraction } from "discord.js";
import { Ability } from "../../framework/models";
import { ArgumentsOf } from "../../framework/structures/commands/ArgumentsOf";
import { Command } from "../../framework/structures/commands/Command";
import { CommandOptionTypes, AugmentationTypes } from "../../typings";

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
		this.client.logger.info({ command: "ability", value: args.ability.name });
	}
}
