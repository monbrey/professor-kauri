import type { API, APIChatInputApplicationCommandGuildInteraction, RESTPostAPIChatInputApplicationCommandsJSONBody } from "@discordjs/core";
import { ApplicationCommandOptionType, ApplicationIntegrationType, InteractionContextType } from "@discordjs/core";
import { PokeAPI } from "pokeapi-typescript";
import type { ContainerComponent } from "../../types.js";
import { urpg } from "../../util/urpg.js";

export const data: RESTPostAPIChatInputApplicationCommandsJSONBody = {
	name: "learnset",
	description: "Get Ultradex movelist data for a Pokemon",
	contexts: [InteractionContextType.Guild],
	integration_types: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
	options: [
		{
			name: "species",
			description: "Pokemon species to search for",
			type: ApplicationCommandOptionType.String,
			required: true,
			// autocomplete: true,
		},
	],
} as const;

export const execute = async (api: API, interaction: APIChatInputApplicationCommandGuildInteraction) => {
	console.log("Executing");
	const query = interaction.data.options?.find((x) => x.name === "species");
	if (query?.type !== ApplicationCommandOptionType.String) {
		return;
	}

	const dex_entry = await urpg.species.fetch(query.value);
	if (!dex_entry) {
		return;
	}

	const pokeapi_entry = await PokeAPI.Pokemon.fetch(query.value);
	if (!pokeapi_entry) {
		return;
	}

	const sorted: { [key: string]: string[]; } = {
		"Level-Up Moves": [],
		TMs: [],
		HMs: [],
		"Breeding Moves": [],
		"Move Tutors": [],
		"Special Moves": [],
	};

	const map: { [key: string]: keyof typeof sorted; } = {
		"LEVEL-UP": "Level-Up Moves",
		TM: "TMs",
		HM: "HMs",
		BREEDING: "Breeding Moves",
		"MOVE TUTOR": "Move Tutors",
		SPECIAL: "Special Moves",
	};

	for (const val of dex_entry.attacks) {
		const key = map[val.method];
		sorted[key].push(val.name);
	}

	const outputs = Object.entries(sorted).map(([name, value]) => ({ type: 10, content: `**${name}**\n${value.sort((a, b) => a.localeCompare(b)).join(", ")}` }));
	const container: ContainerComponent = {
		type: 17,
		components: [
			{
				type: 10,
				content: `### ${dex_entry.name} (#${dex_entry.dexno.toString().padStart(3, "0")})`,
			},
			{
				type: 14,
				divider: true,
			},
			{
				type: 9,
				components: [outputs[0]],
				accessory: {
					type: 11,
					media: { url: pokeapi_entry.sprites.other["official-artwork"].front_default },
				},
			},
			...outputs.slice(1),
		],
	};

	await api.interactions.reply(
		interaction.id,
		interaction.token,
		{
			flags: 1 << 15,
			components: [container],
		},
	);
};
