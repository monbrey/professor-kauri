import type { API, APIChatInputApplicationCommandGuildInteraction, APIContainerComponent, RESTPostAPIChatInputApplicationCommandsJSONBody } from "@discordjs/core";
import { ApplicationCommandOptionType, ApplicationIntegrationType, ComponentType, InteractionContextType, MessageFlags } from "@discordjs/core";
import { PokeAPI } from "pokeapi-typescript";
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
			autocomplete: true,
		},
	],
};

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
	const container: APIContainerComponent = {
		type: ComponentType.Container,
		components: [
			{
				type: ComponentType.TextDisplay,
				content: `### ${dex_entry.name} (#${dex_entry.dexno.toString().padStart(3, "0")})`,
			},
			{
				type: ComponentType.Separator,
				divider: true,
			},
			{
				type: ComponentType.Section,
				components: [outputs[0]],
				accessory: {
					type: ComponentType.Thumbnail,
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
			flags: MessageFlags.IsComponentsV2,
			components: [container],
		},
	);
};
