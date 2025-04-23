import type { API, APIChatInputApplicationCommandGuildInteraction, RESTPostAPIChatInputApplicationCommandsJSONBody } from "@discordjs/core";
import { ApplicationCommandOptionType, ApplicationIntegrationType, InteractionContextType, MessageFlags } from "@discordjs/core";
import { stripIndents } from "common-tags";

const Section = {
	Battles: 1,
	Contests: 2,
	Park: 3,
	Art: 4,
	Stories: 5,
	Morphic: 6,
};

export const data: RESTPostAPIChatInputApplicationCommandsJSONBody = {
	name: "log",
	description: "Create a log entry",
	contexts: [InteractionContextType.Guild],
	integration_types: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
	options: [
		{
			name: "battles",
			description: "Create a battle log",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "trainer-1",
					description: "Participating trainer #1",
					type: ApplicationCommandOptionType.User,
					required: true,
				},
				{
					name: "trainer-2",
					description: "Participating trainer #2",
					type: ApplicationCommandOptionType.User,
					required: true,
				},
			],
		},
	],
} as const;

export const execute = async (api: API, interaction: APIChatInputApplicationCommandGuildInteraction) => {
	const section = interaction.data.options?.find((x) => x.type === ApplicationCommandOptionType.Subcommand);
	if (!section) {
		return;
	}

	switch (section.name) {
		case "battles": {
			const trainer1 = section.options?.find((x) => x.name === "trainer-1");
			const trainer2 = section.options?.find((x) => x.name === "trainer-2");
			if (!trainer1 || !trainer2) {
				return;
			}

			const container = {
				type: 17,
				components: [
					{
						type: 10,
						content: "### Battle Log #999 (preview)",
					},
					{
						type: 14,
						divider: true,
					},
					{
						type: 10,
						content: stripIndents`
							<@${trainer1.value}> vs <@${trainer2.value}>

							`,
					},
					{
						type: 14,
						divider: true,
					},
					{
						type: 1,
						components: [
							{
								type: 3,
								custom_id: "battle:999:size",
								label: "Team Size",
								options: [{ label: "1v1", value: "1" }, { label: "2v2", value: "2" }, { label: "3v3", value: "3" }, { label: "4v4", value: "4" }, { label: "5v5", value: "5" }, { label: "6v6", value: "6" }],
							},
						],
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
			break;
		}

		default:
			break;
	}
};
