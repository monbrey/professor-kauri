import type { CommandInteraction } from "discord.js";
import { ArgumentsOf } from "../../framework/structures/commands/ArgumentsOf";
import { Command } from "../../framework/structures/commands/Command";
import { AugmentationTypes, CommandOptionTypes } from "../../typings";

export const data = {
	name: "item",
	description: "Get Infohub data for an item",
	options: [{
		name: "item",
		description: "Name of the item to search for",
		type: CommandOptionTypes.String,
		augmentTo: AugmentationTypes.Item,
		required: true,
	}],
} as const;

export default class ItemCommand extends Command {
	public async exec(interaction: CommandInteraction, args: ArgumentsOf<typeof data>): Promise<void> {
		//     this.client.logger.info({
		//       key: interaction.commandName,
		//       query: item,
		//       result: value.itemName,
		//     });
		await interaction.reply({ embeds: [args.item?.info()] });
	}
}
