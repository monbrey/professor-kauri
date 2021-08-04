import { ArgumentsOf, AugmentationTypes, Command, CommandOptionTypes } from "@professor-kauri/framework";
import type { CommandInteraction } from "discord.js";

export const data = {
	name: "attack",
	description: "Look-up Pokemon attack data",
	options: [
		{
			name: "attack",
			description: "Name of the attack to search for",
			type: CommandOptionTypes.String,
			augmentTo: AugmentationTypes.Attack,
			required: true,
		},
	],
} as const;

export default class AttackCommand extends Command {
	public async exec(interaction: CommandInteraction, args: ArgumentsOf<typeof data>): Promise<void> {
		await interaction.reply({ embeds: [args.attack.info()] });
	}
}
