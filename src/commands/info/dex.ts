import type { API, APIApplicationCommandAutocompleteGuildInteraction, APIChatInputApplicationCommandGuildInteraction, RESTPostAPIChatInputApplicationCommandsJSONBody } from "@discordjs/core";
import { ApplicationCommandOptionType, ApplicationIntegrationType, ButtonStyle, InteractionContextType } from "@discordjs/core";
import { stripIndents } from "common-tags";
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

	const result = await urpg.species.fetch(query.value);
	if (!result) {
		return;
	}

	const container: ContainerComponent = {
		type: 17,
		components: [
			{
				type: 9,
				components: [
					{
						type: 10,
						content: stripIndents`
							### ${result.name} (#${result.dexno})
							*The ${result.classification} Pokémon*`,
					},
				],
				accessory: {
					type: 2,
					label: "Ultradex",
					style: ButtonStyle.Link,
					url: `https://pokemonurpg.com/pokemon/${result.name}`,
				},
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
						Type: ${titleCase(result.type1)} | ${titleCase(result.type2)}
						Abilities:
							${abilities(result)}
						Legal Genders: ${genders(result)}
						Height: ${result.height}m
						Weight: ${result.weight}kg
						Ranks: Story: ${result.storyRank.name} | Art: ${result.artRank.name}
						Prices:
							${prices(result)}
						`,
					},
				],
				accessory: {
					type: 11,
					media: { url: `https://pokemonurpg.com/img/models/${result.dexno}.gif` },
				},
			},
			{
				type: 14,
				divider: true,
			},
			{
				type: 10,
				content: stripIndents`\`\`\`
						HP  | Att | Def | SpA | SpD | Spe
						${result.hp} | ${result.attack} | ${result.defense} | ${result.specialAttack} | ${result.specialDefense} | ${result.speed}
					\`\`\``,
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
