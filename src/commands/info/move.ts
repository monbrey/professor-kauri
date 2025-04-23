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

