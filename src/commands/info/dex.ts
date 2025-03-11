import type { API, APIApplicationCommandAutocompleteGuildInteraction, APIChatInputApplicationCommandGuildInteraction, RESTPostAPIChatInputApplicationCommandsJSONBody } from "@discordjs/core";
import { ApplicationCommandOptionType, ApplicationIntegrationType, ButtonStyle, InteractionContextType } from "@discordjs/core";
import { stripIndents } from "common-tags";
import { PokeAPI } from "pokeapi-typescript";
import type { ContainerComponent } from "../../types.js";
import { abilities, genders, prices, titleCase } from "../../util/formatters.js";
import { urpg } from "../../util/urpg.js";

export const data: RESTPostAPIChatInputApplicationCommandsJSONBody = {
	name: "dex",
	description: "Get Ultradex data for a Pokemon",
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
} as const;

export const execute = async (api: API, interaction: APIChatInputApplicationCommandGuildInteraction) => {
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

	const container: ContainerComponent = {
		type: 17,
		components: [
			{
				type: 10,
				content: stripIndents`
					### ${dex_entry.name} (#${dex_entry.dexno.toString().padStart(3, "0")})
					*The ${dex_entry.classification} Pokémon*`,
			},
			{
				type: 14,
				divider: true,
			},
			{
				type: 9,
				components: [
					{
						type: 10,
						content: stripIndents`
						**Type**: ${titleCase(dex_entry.type1)} | ${titleCase(dex_entry.type2)}
						**Abilities**:
							${abilities(dex_entry)}
						**Legal Genders**:
							${genders(dex_entry)}
						**Height**: ${dex_entry.height}m
						**Weight**: ${dex_entry.weight}kg
						**Ranks**: Story: ${dex_entry.storyRank.name} | Art: ${dex_entry.artRank.name}
						**Prices**:
							${prices(dex_entry)}
						`,
					},
				],
				accessory: {
					type: 11,
					media: { url: pokeapi_entry.sprites.other["official-artwork"].front_default },
				},
			},
			{
				type: 10,
				content: stripIndents`**Stats**\`\`\`
						HP  | Att | Def | SpA | SpD | Spe
						${dex_entry.hp} | ${dex_entry.attack} | ${dex_entry.defense} | ${dex_entry.specialAttack} | ${dex_entry.specialDefense} | ${dex_entry.speed}
					\`\`\``,
			},
			{
				type: 14,
				divider: true,
			},
			{
				type: 1,
				components: [
					{
						type: 2,
						custom_id: `moves-${dex_entry.name}`,
						label: "Moves",
						style: ButtonStyle.Secondary,
					},
					{
						type: 2,
						label: "Ultradex",
						style: ButtonStyle.Link,
						url: `https://pokemonurpg.com/pokemon/${dex_entry.name}`,
					},
				],
			},
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

export const autocomplete = async (api: API, interaction: APIApplicationCommandAutocompleteGuildInteraction) => {
	const query = interaction.data.options.find((x) => x.name === "species");
	if (query?.type !== ApplicationCommandOptionType.String) {
		return;
	}

	const list = await urpg.species.listClosest(query.value);
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
