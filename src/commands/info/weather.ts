import type { CommandInteraction } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { ArgumentsOf } from "../../framework/structures/commands/ArgumentsOf";
import { Command } from "../../framework/structures/commands/Command";
import { AugmentationTypes } from "../../typings";

export const data = {
	name: "weather",
	description: "Retrieve weather effect information",
	options: [{

		name: "effect",
		description: "Weather effect to look-up",
		type: ApplicationCommandOptionTypes.STRING,
		augmentTo: AugmentationTypes.Weather,
		choices: [
			{ value: "rain", name: "Rain" },
			{ value: "sun", name: "Harsh Sunlight" },
			{ value: "sand", name: "Sandstorm" },
			{ value: "hail", name: "Hail" },
			{ value: "fog", name: "Fog" },
			{ value: "ex-sun", name: "Extremely Harsh Sunlight" },
			{ value: "h-rain", name: "Heavy Rain" },
			{ value: "mac", name: "Mysterious Air Current" },
		],
	}],
	global: true,
} as const;

export default class WeatherCommand extends Command {
	public async exec(interaction: CommandInteraction, { effect }: ArgumentsOf<typeof data>): Promise<void> {
		if (!effect) {
			const db = await this.client.getDatabase();
			const weathers = await db.collection("weather").find().toArray();
			const list = weathers.map(w => `${this.client.emojis.cache.get(w.emoji) ?? w.emoji} ${w.weatherName}`);

			return interaction.reply({
				embeds: [{
					title: "Weather Conditions",
					color: 0xffffff,
					description: `${list.join("\n")}\n\nFor more information on any weather condition, use \`/weather [name]\``,
				}],
			});
		} else {
			return interaction.reply({ embeds: [effect.info(this.client)] });
		}
	}
}
