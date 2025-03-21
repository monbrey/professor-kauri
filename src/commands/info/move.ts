// import type { CommandInteraction } from "discord.js";
// import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
// import type { ArgumentsOf } from "../../framework/structures/commands/ArgumentsOf";
// import { Command } from "../../framework/structures/commands/Command";
// import { AugmentationTypes } from "../../typings";

import { ApplicationCommandOptionType } from "@discordjs/core";

export const data = {
	name: "move",
	description: "Look-up Pokemon move data",
	options: [
		{
			name: "move",
			description: "Name of the move to search for",
			type: ApplicationCommandOptionType.String,
			required: true,
			autocomplete: true,
		},
	],
};

