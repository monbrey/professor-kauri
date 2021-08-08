import { ArgumentsOf, AugmentationTypes, Command, CommandOptionTypes } from "@professor-kauri/framework";
import type { CommandInteraction } from "discord.js";

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