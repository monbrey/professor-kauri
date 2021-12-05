import type { CommandInteraction } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { ArgumentsOf } from "../../framework/structures/commands/ArgumentsOf";
import { Command } from "../../framework/structures/commands/Command";
import { AugmentationTypes } from "../../typings";

export const data = {
	name: "ability",
	description: "Get Infohub data for an ability",
	options: [
		{
			name: "ability",
			description: "Name of the ability to search for",
			type: ApplicationCommandOptionTypes.STRING,
			augmentTo: AugmentationTypes.Ability,
			required: true,
		},
	],
	global: true,
} as const;

export default class AbilityCommand extends Command {
	public async exec(interaction: CommandInteraction, args: ArgumentsOf<typeof data>): Promise<void> {
		await interaction.reply({ embeds: [args.ability.info()] });
		this.client.logger.info({ command: "ability", value: args.ability.name });
	}
}
