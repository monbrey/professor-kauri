import type { CommandInteraction } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { ArgumentsOf } from "../../framework/structures/commands/ArgumentsOf";
import { Command } from "../../framework/structures/commands/Command";
import { AugmentationTypes } from "../../typings";

export const data = {
	name: "attack",
	description: "Look-up Pokemon attack data",
	options: [
		{
			name: "attack",
			description: "Name of the attack to search for",
			type: ApplicationCommandOptionTypes.STRING,
			augmentTo: AugmentationTypes.Attack,
			required: true,
		},
	],
	global: true,
} as const;

export default class AttackCommand extends Command {
	public async exec(interaction: CommandInteraction, args: ArgumentsOf<typeof data>): Promise<void> {
		await interaction.reply({ embeds: [args.attack.info()] });
		this.client.logger.info({ command: "attack", value: args.attack.name });
	}
}
