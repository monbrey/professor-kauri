import type { API, APIApplicationCommandAutocompleteGuildInteraction, APIChatInputApplicationCommandGuildInteraction, APIContainerComponent } from "@discordjs/core";
import { ApplicationCommandOptionType, ComponentType, MessageFlags } from "@discordjs/core";
import { stripIndents } from "common-tags";
import { PokeAPI } from "pokeapi-typescript";
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

	const container: APIContainerComponent = {
		type: ComponentType.Container,
		components: [
			{
				type: ComponentType.TextDisplay,
				content: `## ${entry.names.find((name) => name.language.name === "en")?.name}`,
			},
			{
				type: ComponentType.Separator,
				divider: true,
			},
			{
				type: ComponentType.TextDisplay,
				content: stripIndents`### Description
				${entry.effect_entries.find((effect) => effect.language.name === "en")?.short_effect}`,
			},
			{
				type: ComponentType.TextDisplay,
				content: stripIndents`### Pokemon with ${entry.names.find((name) => name.language.name === "en")?.name} as a primary ability
				${entry.pokemon.filter((p) => !p.is_hidden).map((pokemon) => titleCase(pokemon.pokemon.name)).join(", ")}`,
			},
			{
				type: ComponentType.TextDisplay,
				content: stripIndents`### Pokemon with ${entry.names.find((name) => name.language.name === "en")?.name} as a hidden ability
				${entry.pokemon.filter((p) => p.is_hidden).map((pokemon) => titleCase(pokemon.pokemon.name)).join(", ")}`,
			},
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
