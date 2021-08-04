import { ArgumentsOf, AugmentationTypes, Command, CommandOptionTypes } from "@professor-kauri/framework";
import { CommandInteraction, MessageEmbed } from "discord.js";

export const data = {
	name: "speed",
	description: "Provides information on speed-based moves between two Pokemon / speeds",
	options: [{
		name: "by-species",
		description: "Calculated based on species name(s)",
		type: CommandOptionTypes.Subcommand,
		options: [{
			name: "attacker",
			description: "Pokemon species using the speed-based move",
			type: CommandOptionTypes.String,
			augmentTo: AugmentationTypes.Pokemon,
			required: true,
		}, {
			name: "defender",
			description: "Pokemon species targetted by speed-based move",
			type: CommandOptionTypes.String,
			augmentTo: AugmentationTypes.Pokemon,
			required: true,
		}],
	}, {
		name: "by-number",
		description: "Calculated based on speed value(s)",
		type: CommandOptionTypes.Subcommand,
		options: [{
			name: "attacker",
			description: "Speed stat value using the speed-based move",
			type: CommandOptionTypes.Integer,
			required: true,
		}, {
			name: "defender",
			description: "Speed stat value targetted by speed-based move",
			type: CommandOptionTypes.Integer,
			required: true,
		}],
	}],
} as const;

export default class SpeedCommand extends Command {
	private calcElectro(attacker: number, defender: number): number {
		const percentage = (defender / attacker) * 100;

		if (percentage > 100 || percentage === 0) return 40;
		if (percentage > 50) return 60;
		if (percentage > 33.33) return 80;
		if (percentage > 25) return 120;
		if (percentage > 0) return 150;

		return 0;
	}

	private calcGyro(attacker: number, defender: number): number {
		if (attacker === 0) return 1;

		return Math.min(150, Math.floor((25 * defender) / attacker + 1));
	}

	public async exec(interaction: CommandInteraction, args: ArgumentsOf<typeof data>): Promise<void> {
		let attacker, defender;
		if (args["by-species"]) {
			const _args = args["by-species"];
			attacker = { name: _args.attacker.name, value: _args.attacker.speed };
			defender = { name: _args.defender.name, value: _args.defender.speed };
		} else if (args["by-number"]) {
			const _args = args["by-number"];
			attacker = { name: `${_args.attacker}`, value: _args.attacker };
			defender = { name: `${_args.defender}`, value: _args.defender };
		} else {
			return;
		}

		const embed = new MessageEmbed()
			.setTitle(`${attacker.name} vs ${defender.name}`)
			.setDescription(`**Attacking Speed**: ${attacker.value}\n**Defending Speed**: ${defender.value}`)
			.addFields([
				{ name: "Electro Ball", value: `${this.calcElectro(attacker.value, defender.value)} BP`, inline: true },
				{ name: "Gyro Ball", value: `${this.calcGyro(attacker.value, defender.value)} BP`, inline: true },
			]);

		await interaction.reply({ embeds: [embed] });
	}
}
