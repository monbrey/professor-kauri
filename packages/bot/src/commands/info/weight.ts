import { ArgumentsOf, AugmentationTypes, Command, CommandOptionTypes } from "@professor-kauri/framework";
import type { CommandInteraction, MessageEmbedOptions } from "discord.js";

export const data = {
	name: "weight",
	description: "Provides information on weight-based moves between one or two Pokemon / weights",
	options: [{
		name: "by-species",
		description: "Calculate based on species name(s)",
		type: CommandOptionTypes.Subcommand,
		options: [{
			name: "defender",
			description: "Pokemon species targetted by weight-based move",
			type: CommandOptionTypes.String,
			augmentTo: AugmentationTypes.Pokemon,
			required: true,
		}, {
			name: "attacker",
			description: "Pokemon species using the weight-based move",
			type: CommandOptionTypes.String,
			augmentTo: AugmentationTypes.Pokemon,
		}],
	}, {
		name: "by-number",
		description: "Calculate based on weight value(s)",
		type: CommandOptionTypes.Subcommand,
		options: [{
			name: "defender",
			description: "Weight stat value targetted by weight-based move",
			type: CommandOptionTypes.Number,
			required: true,
		}, {
			name: "attacker",
			description: "Weight value using the weight-based move",
			type: CommandOptionTypes.Number,
		}],
	}],
} as const;

export default class WeightCommand extends Command {
	private calcOne(weight: number): number {
		if (weight <= 10) return 20;
		if (weight <= 25) return 40;
		if (weight <= 50) return 60;
		if (weight <= 100) return 80;
		if (weight <= 200) return 100;
		return 120;
	}

	private calcTwo(user: number, target: number): number {
		const ratio = Math.floor(user / target);
		if (ratio <= 1) return 40;
		if (ratio === 2) return 60;
		if (ratio === 3) return 80;
		if (ratio === 4) return 100;
		return 120;
	}

	public async exec(
		interaction: CommandInteraction,
		{ "by-species": species, "by-number": number }: ArgumentsOf<typeof data>
	): Promise<void> {
		let attacker, defender;
		if (species) {
			attacker = species.attacker && { name: species.attacker.name, value: species.attacker.speed };
			defender = { name: species.defender.name, value: species.defender.speed };
		} else if (number) {
			attacker = number.attacker && { name: `${number.attacker}`, value: number.attacker };
			defender = { name: `${number.defender}`, value: number.defender };
		} else {
			return;
		}

		let embed: MessageEmbedOptions;
		if (attacker) {
			embed = {
				title: `${attacker.name} vs ${defender.name}`,
				description: `Attacking Weight: ${attacker.value}\nDefending Weight: ${defender.value}`,
				fields: [
					{
						name: "Heat Crash / Heavy Slam",
						value: `${this.calcTwo(attacker.value, defender.value)} BP`, inline: true,
					}, {
						name: "Grass Knot / Low Kick",
						value: `${this.calcOne(attacker.value)} BP`, inline: true,
					},
				],
			};
		} else {
			embed = {
				title: `${defender.name}`,
				description: `**Defending Weight**: ${defender.value}`,
				fields: [
					{ name: "**Grass Knot / Low Kick**", value: `${this.calcOne(defender.value)} BP`, inline: true },
				],
			};
		}

		await interaction.reply({ embeds: [embed] });
	}
}