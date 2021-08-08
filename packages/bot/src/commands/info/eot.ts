import {
	ArgumentsOf,
	AugmentationTypes,
	Command,
	CommandExecutionError,
	CommandOptionTypes,
} from "@professor-kauri/framework";
import { CommandInteraction, MessageEmbed } from "discord.js";

export const data = {
	name: "eot",
	description: "Provides End-of-Turn effect information from the Refpedia",
	options: [
		{
			name: "effect",
			description: "The name of an End of Turn Effect to lookup",
			type: CommandOptionTypes.String,
			augmentTo: AugmentationTypes.EOT,
			required: true,
		},
	],
} as const;

export default class EotCommand extends Command {
	public async exec(interaction: CommandInteraction, { effect }: ArgumentsOf<typeof data>): Promise<void> {
		if (!effect) throw new CommandExecutionError("Command parameter 'effect' not found");

		console.log(effect);
		const surrounding = await effect.getSurrounding(this.client);

		const grouped = [];
		for (const e of surrounding) {
			const same = grouped.find(g => g.order === e.order);
			if (same) {
				same.effect = `${same.effect}, ${e.effect}`;
			} else {
				grouped.push(e);
			}
		}

		const groupString = grouped
			.map(g => {
				const number = `${g.order.toString().includes(".") ? ` ${g.order.toString().split(".")[1]}.` : `${g.order}.`}`;
				return `${number.padEnd(4, " ")}${g.effect}`;
			})
			.join("\n");

		const embed = new MessageEmbed()
			.setTitle(effect.effect)
			.setDescription(`${effect.effect} occurs at position ${effect.order}`)
			.addFields({ name: "**Surrounding Effects**", value: `\`\`\`${groupString}\`\`\`` });

		await interaction.reply({ embeds: [embed] });
	}
}