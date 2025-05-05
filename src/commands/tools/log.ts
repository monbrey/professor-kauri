import type { API, APIChatInputApplicationCommandGuildInteraction, APIContainerComponent, APIMessageComponentButtonInteraction, APIMessageComponentSelectMenuInteraction, APIMessageUserSelectInteractionData, APIModalSubmitInteraction, APIUser, RESTPostAPIChatInputApplicationCommandsJSONBody } from "@discordjs/core";
import { ApplicationCommandOptionType, ApplicationIntegrationType, ButtonStyle, ComponentType, InteractionContextType, MessageFlags, TextInputStyle } from "@discordjs/core";
import { stripIndents } from "common-tags";

const Section = {
	Battles: 1,
	Contests: 2,
	Park: 3,
	Art: 4,
	Stories: 5,
	Morphic: 6,
};

class Log {
	winner?: APIUser;
	winningTeam?: string;
	loser?: APIUser;
	losingTeam?: string;
	description?: string;
	size?: string;
	generation?: string;
	privacy?: string;
	format?: string;
	clauses?: string[];
	createdAt?: Date;

	private formatRuleBlock() {
		return stripIndents`
			${this.winner && this.loser ? `**<@${this.winner.id}> vs <@${this.loser.id}>**` : ""}
			${this.size ? `${this.size}v${this.size}` : ""}
			${this.generation ?? ""}
			${this.privacy ?? ""}
			${this.format ?? ""}
			${this.clauses?.join(", ") ?? ""}
		`;
	}

	private formatTeamBlock() {
		return this.winner && this.loser && this.winningTeam && this.losingTeam ?
			stripIndents`
				${this.winner?.username}'s ${this.winningTeam}
				vs
				${this.loser?.username}'s ${this.losingTeam}
			` : "";
	}

	private formatCashBlock() {
		return stripIndents`
			${this.winner?.username ?? "*Pending*"}: $${Number(this.size) * 500}
			${this.loser?.username ?? "*Pending*"}: $${Number(this.size) * 250}
		`;
	}

	public generateLogContainer(draft = true) {
		const container: APIContainerComponent = {
			type: ComponentType.Container,
			components: [
				{
					type: ComponentType.TextDisplay,
					content: `### Battle Log #999${draft ? " (draft)" : ""}`,
				},
				{
					type: ComponentType.Separator,
					divider: true,
				},
			],
		};

		const rules = this.formatRuleBlock();
		if (rules.trim().length > 0) {
			container.components.push({
				type: ComponentType.TextDisplay,
				content: rules,
			}, {
				type: ComponentType.Separator,
				divider: true,
			});
		}

		const teams = this.formatTeamBlock();
		if (teams.trim().length > 0) {
			container.components.push({
				type: ComponentType.TextDisplay,
				content: teams,
			}, {
				type: ComponentType.Separator,
				divider: true,
			});
		}

		if (this.description) {
			container.components.push({
				type: ComponentType.TextDisplay,
				content: this.description,
			}, {
				type: ComponentType.Separator,
				divider: true,
			});
		}

		const cash = this.formatCashBlock();
		if (cash.trim().length > 0) {
			container.components.push({
				type: ComponentType.TextDisplay,
				content: cash,
			});
		}

		return container;
	}
}

const logs = new Map<number, Log>();

export const data: RESTPostAPIChatInputApplicationCommandsJSONBody = {
	name: "log",
	description: "Create a log entry",
	contexts: [InteractionContextType.Guild],
	integration_types: [
		ApplicationIntegrationType.GuildInstall,
		ApplicationIntegrationType.UserInstall,
	],
	options: [
		{
			name: "battles",
			description: "Create a battle log",
			type: ApplicationCommandOptionType.Subcommand,
			options: [],
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
			const log = new Log();
			logs.set(999, log);

			const controlContainer: APIContainerComponent = {
				type: ComponentType.Container,
				components: [
					{
						type: ComponentType.TextDisplay,
						content: "### Input controls",
					},
					{
						type: ComponentType.Separator,
						divider: true,
					},
					{
						type: ComponentType.ActionRow,
						components: [
							{
								custom_id: "log:999:winner",
								placeholder: "Winning trainer",
								type: ComponentType.UserSelect,
							},
						],
					},
					{
						type: ComponentType.ActionRow,
						components: [
							{
								custom_id: "log:999:loser",
								placeholder: "Losing trainer",
								type: ComponentType.UserSelect,
							},
						],
					},
					{
						type: ComponentType.Separator,
						divider: true,
					},
					{
						type: ComponentType.ActionRow,
						components: [
							{
								type: ComponentType.StringSelect,
								custom_id: "log:999:size",
								placeholder: "Size",
								options: [
									{ label: "2v2", value: "2" },
									{ label: "3v3", value: "3" },
									{ label: "4v4", value: "4" },
									{ label: "5v5", value: "5" },
									{ label: "6v6", value: "6" },
								],
							},
						],
					},
					{
						type: ComponentType.ActionRow,
						components: [
							{
								type: ComponentType.StringSelect,
								custom_id: "log:999:generation",
								placeholder: "Generation",
								options: [
									{ label: "Gold /Silver/Crystal", value: "GSC" },
									{ label: "Ruby/Sapphire/Emerald", value: "RSE" },
									{ label: "Standard Meta", value: "SM" },
								],
							},
						],
					},
					{
						type: ComponentType.ActionRow,
						components: [
							{
								type: ComponentType.StringSelect,
								custom_id: "log:999:privacy",
								placeholder: "Privacy",
								options: [
									{ label: "Public", value: "Public" },
									{ label: "Private", value: "Private" },
								],
							},
						],
					},
					{
						type: ComponentType.ActionRow,
						components: [
							{
								type: ComponentType.StringSelect,
								custom_id: "log:999:format",
								placeholder: "Format",
								options: [
									{ label: "Full", value: "Full" },
									{ label: "Preview", value: "Preview" },
									{ label: "Box", value: "Box" },
								],
							},
						],
					},
					{
						type: ComponentType.ActionRow,
						components: [
							{
								type: ComponentType.StringSelect,
								custom_id: "log:999:clauses",
								placeholder: "Clauses",
								min_values: 1,
								max_values: 15,
								options: [
									{ label: "Sleep Clause", value: "Sleep" },
									{ label: "Freeze Clause", value: "Freeze" },
									{ label: "Evasion Clause", value: "Evasion" },
									{ label: "Accuracy Clause", value: "Accuracy" },
									{ label: "No OHKO Moves", value: "OHKO" },
									{ label: "No Duplicate Species", value: "Species" },
									{ label: "Held Items: On", value: "Helds On" },
									{ label: "Held Items: Unique", value: "Helds Unique" },
									{ label: "Held Items: Off", value: "Helds Off" },
									{ label: "No Mega Evolution", value: "No Mega Evolution" },
									{ label: "No Z-Moves", value: "No Z-Moves" },
									{ label: "No Dynamax", value: "No Dynamax" },
									{ label: "No Legendary Pokemon", value: "No Legendary Pokemon" },
									{ label: "No Imprison", value: "No Imprison" },
									{ label: "No Power Construct", value: "No Power Construct" },
								],
							},
						],
					},
					{
						type: ComponentType.ActionRow,
						components: [
							{
								type: ComponentType.Button,
								custom_id: "log:999:standardclauses",
								label: "Use Standard Clauses",
								style: ButtonStyle.Secondary,
							},
							{
								type: ComponentType.Button,
								custom_id: "log:999:selectedclauses",
								label: "Clear Selected Clauses",
								style: ButtonStyle.Secondary,
							},
						],
					},
					{
						type: ComponentType.Separator,
						divider: true,
					},
					{
						type: ComponentType.ActionRow,
						components: [
							{
								type: ComponentType.StringSelect,
								custom_id: "log:999:loading",
								placeholder: "Special Battles",
								options: [
									{ label: "Gym", value: "1" },
									{ label: "Other", value: "2" },
								],
								disabled: true,
							},
						],
					},
					{
						type: ComponentType.Separator,
						divider: true,
					},
					{
						type: ComponentType.ActionRow,
						components: [
							{
								type: ComponentType.Button,
								custom_id: "log:999:entertext",
								label: "Enter Text",
								style: ButtonStyle.Secondary,
							},
							{
								type: ComponentType.Button,
								custom_id: "log:999:finalise",
								label: "Save and Submit",
								style: ButtonStyle.Primary,
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
					components: [
						log.generateLogContainer(),
						controlContainer,
					],
				},
			);
			break;
		}

		default:
			break;
	}
};

export const onClick = async (api: API, interaction: APIMessageComponentButtonInteraction) => {
	const [
		command,
		id,
		section,
	] = interaction.data.custom_id.split(":");
	const log = logs.get(Number(id));
	if (!log) {
		return;
	}

	switch (section) {
		case "entertext":
			await api.interactions.createModal(
				interaction.id,
				interaction.token,
				{
					custom_id: "log:999:modal",
					title: "Enter log text",
					components: [
						{
							type: ComponentType.ActionRow,
							components: [
								{
									type: ComponentType.TextInput,
									custom_id: "log:999:winningteam",
									label: "Winning team",
									style: TextInputStyle.Short,
								},
							],
						},
						{
							type: ComponentType.ActionRow,
							components: [
								{
									type: ComponentType.TextInput,
									custom_id: "log:999:losingteam",
									label: "Losing team",
									style: TextInputStyle.Short,
								},
							],
						},
						{
							type: ComponentType.ActionRow,
							components: [
								{
									type: ComponentType.TextInput,
									custom_id: "log:999:description",
									label: "Battle description",
									style: TextInputStyle.Paragraph,
								},
							],
						},
					],
				},
			);
			break;
		case "finalise":
			await api.interactions.updateMessage(
				interaction.id,
				interaction.token,
				{ components: [log.generateLogContainer(false)] },
			);

			await api.interactions.followUp(
				interaction.application_id,
				interaction.token,
				{
					content: "Log saved!",
					flags: MessageFlags.Ephemeral,
				},
			);

			break;
	}
};

export const onSelect = async (api: API, interaction: APIMessageComponentSelectMenuInteraction) => {
	const [
		command,
		id,
		section,
	] = interaction.data.custom_id.split(":");
	const log = logs.get(Number(id));
	if (!log) {
		return;
	}

	switch (section) {
		case "size":
			log.size = interaction.data.values[0];
			break;
		case "generation":
			log.generation = interaction.data.values[0];
			break;
		case "privacy":
			log.privacy = interaction.data.values[0];
			break;
		case "format":
			log.format = interaction.data.values[0];
			break;
		case "clauses":
			log.clauses = interaction.data.values;
			break;
		case "winner":
			log.winner = (interaction.data as APIMessageUserSelectInteractionData).resolved.users[interaction.data.values[0]];
			break;
		case "loser":
			log.loser = (interaction.data as APIMessageUserSelectInteractionData).resolved.users[interaction.data.values[0]];
			break;
	}

	await api.interactions.updateMessage(
		interaction.id,
		interaction.token,
		{
			components: [
				log.generateLogContainer(),
				interaction.message?.components?.[1]!,
			],
		},
	);
};

export const onModal = async (api: API, interaction: APIModalSubmitInteraction) => {
	const [
		command,
		id,
	] = interaction.data.custom_id.split(":");
	const log = logs.get(Number(id));
	if (!log) {
		return;
	}

	log.winningTeam = interaction.data.components[0].components[0].value;
	log.losingTeam = interaction.data.components[1].components[0].value;
	log.description = interaction.data.components[2].components[0].value;

	await api.interactions.updateMessage(
		interaction.id,
		interaction.token,
		{
			components: [
				log.generateLogContainer(),
				interaction.message?.components?.[1]!,
			],
		},
	);
};
