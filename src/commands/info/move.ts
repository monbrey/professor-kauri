import type { CommandInteraction } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { ArgumentsOf } from "../../framework/structures/commands/ArgumentsOf";
import { Command } from "../../framework/structures/commands/Command";
import { AugmentationTypes } from "../../typings";

export const data = {
	name: "move",
	description: "Look-up Pokemon move data",
	options: [
		{
			name: "move",
			description: "Name of the move to search for",
			type: ApplicationCommandOptionTypes.STRING,
			augmentTo: AugmentationTypes.Attack,
			required: true,
		},
	],
	global: true,
} as const;

export default class AttackCommand extends Command {
	public async exec(interaction: CommandInteraction, args: ArgumentsOf<typeof data>): Promise<void> {
		await interaction.reply({ embeds: [args.move.info()] });
		this.client.logger.info({ command: "move", value: args.move.name });
	}
}
