import type { AutocompleteInteraction, CommandInteraction, CommandInteractionOption, Snowflake } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import type { Command } from "./Command";
import { Models } from "../..";
import { ModelInstance } from "../../../typings";
import { KauriClient } from "../KauriClient";
import { KauriHandler, KauriHandlerOptions } from "../KauriHandler";

export class CommandHandler extends KauriHandler<Command> {
	constructor(client: KauriClient, options: KauriHandlerOptions) {
		super(client, options);

		this.setup();
	}

	private setup(): void {
		this.client.once("ready", async () => {
			await this.fetch();

			this.client.on("interactionCreate", i => {
				if (i.isCommand()) {
					this.handleCommand(i);
				} else if (i.isAutocomplete()) {
					this.handleAutocomplete(i);
				}
			});
		});
	}

	private async handleCommand(interaction: CommandInteraction): Promise<void> {
		const module = this.modules.get(interaction.commandName);
		if (!module) {
			interaction.reply({ content: `\`${interaction.commandName}\` is not yet implemented!`, ephemeral: true });
			return;
		}

		if (module.defer) await interaction.deferReply();

		const args = await this.parseOptions(module, interaction.options.data);

		try {
			await module.exec(interaction, args);
		} catch (err) {
			console.error(err);
			if (err instanceof Error) {
				// this.client.logger.error(err);
				if (interaction.deferred || interaction.replied) {
					interaction.editReply(`[${interaction.commandName}] ${err.message}`);
				} else {
					interaction.reply({
						content: `[${interaction.commandName}] ${err.message}`,
						ephemeral: true,
					});
				}
			}
		}
	}

	private async handleAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
		const module = this.modules.get(interaction.commandName);
		if (!module) {
			return;
		}

		let focused = interaction.options.data.find(o => o.focused);
		if (!focused && interaction.options.data[0]?.type === "SUB_COMMAND") {
			focused = interaction.options.data[0].options?.find(o => o.focused);
		}

		if (!focused) {
			return;
		}

		try {
			await module.autocomplete(interaction, focused);
		} catch (err) {
			console.error(err);
		}
	}

	public async fetch({ global = true, guild = true } = {}): Promise<this> {
		if (global) await this.client.application?.commands.fetch();
		if (guild) {
			const guildId = (process.env.GUILD ?? "135864828240592896") as Snowflake;
			if (!guildId) throw new Error("No guild");
			await this.client.guilds.cache.get(guildId)?.commands.fetch();
		}

		return this;
	}

	private async parseOptions(
		module: Command,
		options?: readonly CommandInteractionOption[],
		sub?: { group?: string; command?: string },
	) {
		if (!options) return null;

		const args: { [key: string]: unknown } = {};

		for (const option of options) {
			switch (option.type) {
				case "SUB_COMMAND":
					args[option.name] = await this.parseOptions(module, option.options, { ...sub, command: option.name });
					break;
				case "SUB_COMMAND_GROUP":
					args[option.name] = await this.parseOptions(module, option.options, { ...sub, group: option.name });
					break;
				default:
					args[option.name] = await this.parseOption(module, option, sub);
					break;
			}
		}


		return args;
	}

	private async parseOption(
		module: Command,
		option: CommandInteractionOption,
		sub?: { group?: string; command?: string }
	) {
		switch (option.type) {
			case "STRING": {
				return await this.augmentOption(module, option, sub) ?? option.value;
			}
			case "CHANNEL":
				return option.channel;
			case "USER":
				return option.member ?? option.user;
			case "ROLE":
				return option.role;
			case "INTEGER":
			case "BOOLEAN":
			case "NUMBER":
			default:
				return option.value;
		}
	}

	private async augmentOption(module: Command,
		option: CommandInteractionOption,
		sub?: { group?: string; command?: string }
	): Promise<ModelInstance | null> {
		let base;
		if (sub?.group) {
			base = module.options.find(b =>
				b.name === sub.group &&
				b.type === ApplicationCommandOptionTypes.SUB_COMMAND_GROUP
			)?.options ?? [];
		}
		if (sub?.command) {
			base = (base ?? module.options).find(b =>
				b.name === sub.command &&
				b.type === ApplicationCommandOptionTypes.SUB_COMMAND
			)?.options ?? [];
		}
		base = (base ?? module.options).find(b => b.name === option.name);

		if (!base || !base.augmentTo) return null;

		const model = await Models[base.augmentTo].fetch(this.client, `${option.value}`);
		return model ?? null;
	}

	public async deploy({ global = true, guild = true } = {}): Promise<this> {
		// If working in dev mode, deploy all commands to the guild
		if (process.env.NODE_ENV === "development") {
			this.client.application?.commands.set([]);
			if (process.env.GUILD) {
				const target = this.client.guilds.resolve(process.env.GUILD);
				if (!target) throw new Error("Running in dev mode, but no guild onfigured");

				const commands = this.modules;
				try {
					const deployed = await target.commands.set([...commands.values()]);
					const permUpdates = commands.filter(c => c.defaultPermission === false).map(c => {
						const cmd = deployed.find(d => d.name === c.name);
						if (!cmd) throw new Error("Missing command deployment");
						return { id: cmd.id, permissions: c.permissions };
					});

					await target.commands.permissions.set({ fullPermissions: permUpdates });
				} catch (err) {
					console.error(err);
				}
			}

			return this;
		}

		// eslint-disable-next-line max-len
		const [globalCommands, guildCommands] = this.modules.partition(m => m.global);

		if (global) await this.client.application?.commands.set([...globalCommands.values()]);

		if (guild) {
			const guildId = (process.env.GUILD ?? "135864828240592896") as Snowflake;
			const target = this.client.guilds.resolve(guildId);
			if (!target) throw new Error("No guild");

			try {
				const deployed = await target.commands.set([...guildCommands.values()]);
				const permUpdates = guildCommands.filter(c => c.defaultPermission === false).map(c => {
					const cmd = deployed.find(d => d.name === c.name);
					if (!cmd) throw new Error("Missing command deployment");
					return { id: cmd.id, permissions: c.permissions };
				});

				await target.commands.permissions.set({ fullPermissions: permUpdates });
			} catch (err) {
				console.error(err);
			}
		}

		return this;
	}
}
