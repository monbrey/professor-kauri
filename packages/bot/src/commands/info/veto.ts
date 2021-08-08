import { Command } from "@professor-kauri/framework";
import { oneLine, stripIndents } from "common-tags";
import type { Awaited, CommandInteraction } from "discord.js";

export const data = {
	name: "veto",
	description: "Provides Veto Tier informaion from the Refpedia",
} as const;

export default class VetoCommand extends Command {
	public exec(interaction: CommandInteraction): Awaited<void> {
		const embed = {
			title: "Veto Tiers",
			description: stripIndents`${oneLine`
				When multiple effects act on the same Pokemon to prevent the execution of a move,
				the referee will first check one effect, then the next, and so on.
				This is the order that is checked.
				When a move is vetoed from being executed, no other checks are performed.`}
				\`\`\`1.  Freeze / Sleep
				2.  Truant
				3.  Disable
				4.  Imprison
				5.  Heal Block
				6.  Confuse
				7.  Flinch
				8.  Taunt
				9.  Gravity
				10. Attract
				11. Paralysis\`\`\``,
		};

		return interaction.reply({ embeds: [embed] });
	}
}
