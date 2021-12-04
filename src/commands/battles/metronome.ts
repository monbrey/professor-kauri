import type { CommandInteraction } from "discord.js";
import { Models } from "../../framework";
import { Command } from "../../framework/structures/commands/Command";

export const data = {
	name: "metronome",
	description: "Select a random move",
	global: true,
} as const;

export default class MetronomeCommand extends Command {
	public async exec(interaction: CommandInteraction): Promise<void> {
		const move = await Models.Attack.metronome();
		interaction.reply({ embeds: [move.info()] });

		this.client.logger.info({ command: "metronome", value: move.name });
	}
}
