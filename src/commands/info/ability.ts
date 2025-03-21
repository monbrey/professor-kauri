import type { API, APIApplicationCommandAutocompleteGuildInteraction, APIChatInputApplicationCommandGuildInteraction } from "@discordjs/core";
import { ApplicationCommandOptionType } from "@discordjs/core";
import { stripIndents } from "common-tags";
import { PokeAPI } from "pokeapi-typescript";
import type { ContainerComponent } from "../../types.js";
import { ComponentV2Type } from "../../types.js";
import { titleCase } from "../../util/formatters.js";
import { urpg } from "../../util/urpg.js";

export const data = {
	name: "ability",
	description: "Get Infohub data for an ability",
	options: [
		{
			name: "ability",
			description: "Name of the ability to search for",
			type: ApplicationCommandOptionType.String,
			required: true,
			autocomplete: true,
		},
	],
	global: true,
};

export const execute = async (api: API, interaction: APIChatInputApplicationCommandGuildInteraction) => {
	const _query = interaction.data.options?.find((x) => x.name === "ability");
	if (_query?.type !== ApplicationCommandOptionType.String) {
		return;
	}

	const query = _query.value.toLowerCase().replaceAll(" ", "-");
	const entry = await PokeAPI.Ability.fetch(query);
	if (!entry) {
		return;
	}

	const container: ContainerComponent = {
		type: ComponentV2Type.Container,
		components: [
			{
				type: ComponentV2Type.TextDisplay,
				content: `## ${entry.names.find((name) => name.language.name === "en")?.name}`,
			},
			{
				type: ComponentV2Type.Separator,
				divider: true,
			},
			{
				type: ComponentV2Type.TextDisplay,
				content: stripIndents`### Description
				${entry.effect_entries.find((effect) => effect.language.name === "en")?.short_effect}`,
			},
			{
				type: ComponentV2Type.TextDisplay,
				content: stripIndents`### Pokemon with ability
				${entry.pokemon.map((pokemon) => `${titleCase(pokemon.pokemon.name)}${pokemon.is_hidden ? " (HA)" : ""}`).join(", ")}`,
			},
		],
	};

	await api.interactions.reply(
		interaction.id,
		interaction.token,
		{
			flags: 1 << 15,
			// @ts-expect-error Components V2
			components: [container],
		},
	);
};

export const autocomplete = async (api: API, interaction: APIApplicationCommandAutocompleteGuildInteraction) => {
	const query = interaction.data.options.find((x) => x.name === "ability");
	if (query?.type !== ApplicationCommandOptionType.String) {
		return;
	}

	const list = await urpg.ability.listClosest(query.value);
	if (!list) {
		return;
	}

	await api.interactions.createAutocompleteResponse(
		interaction.id,
		interaction.token,
		{
			choices: list.map((result) => ({
				name: result.target,
				value: result.target,
			}
			)),
		},
	);
};
