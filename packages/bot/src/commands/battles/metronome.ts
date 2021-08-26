import { Command, Models } from "@professor-kauri/framework";
import type { CommandInteraction } from "discord.js";

export const data = {
	name: "metronome",
	description: "Select a random move",
} as const;

export default class MetronomeCommand extends Command {
	public async exec(interaction: CommandInteraction): Promise<void> {
		const move = await Models.Attack.metronome();
		interaction.reply({ embeds: [move.info()] });
	}
}
