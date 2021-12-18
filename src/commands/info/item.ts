import type { CommandInteraction } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { ArgumentsOf } from "../../framework/structures/commands/ArgumentsOf";
import { Command } from "../../framework/structures/commands/Command";
import { AugmentationTypes } from "../../typings";

export const data = {
	name: "item",
	description: "Get Infohub data for an item",
	options: [{
		name: "item",
		description: "Name of the item to search for",
		type: ApplicationCommandOptionTypes.STRING,
		augmentTo: AugmentationTypes.Item,
		required: true,
	}],
	global: true,
} as const;

export default class ItemCommand extends Command {
	public async exec(interaction: CommandInteraction, args: ArgumentsOf<typeof data>): Promise<void> {
		await interaction.reply({ embeds: [args.item?.info()] });
		this.client.logger.info({ command: "item", value: args.item.name });
	}
}
