import { ApplicationCommandOptionType, AutocompleteInteraction, CommandInteraction, CommandInteractionOption, Events, Interaction } from 'discord.js';
import { container } from 'tsyringe';
import { Command } from './Command';
import { ModelInstance } from '../../../typings';
import { KauriClient } from '../../client/KauriClient';
import * as Models from '../../models';
import { BaseHandler, BaseHandlerOptions } from '../BaseHandler';

export class CommandHandler extends BaseHandler<Command> {
	public constructor(client: KauriClient, options: BaseHandlerOptions) {
		super(client, options);
	}

	public setup(): this {
		this.client.once('ready', () => {
			this.client.once(Events.InteractionCreate, async (i: Interaction) => {
				if (!i.inCachedGuild()) return;

				if (i.isCommand()) {
					await this.handleCommand(i);
				} else if (i.isAutocomplete()) {
					this.handleAutocomplete(i);
				}
			});
		});

		return this;
	}

	private async handleCommand(interaction: CommandInteraction<'cached'>): Promise<void> {
		try {
			const module = container.resolve<Command>(interaction.commandName);
			// if (module.defer) await interaction.deferReply();
			const args = await this.parseOptions(module, interaction.options.data);
			module.runCommand(interaction, args);
		} catch (e: unknown) {
			this.client.logger.captureException(e);
			if (e instanceof Error) {
				if (interaction.deferred) {
					await interaction.editReply(`[${interaction.commandName}] ${e.message}`);
				} else if (interaction.replied) {
					await interaction.followUp({
						content: `[${interaction.commandName}] ${e.message}`,
						ephemeral: Boolean(interaction.ephemeral)
					});
				} else {
					await interaction.reply({
						content: `[${interaction.commandName}] ${e.message}`,
						ephemeral: true
					});
				}
			}
		}
	}

	private handleAutocomplete(interaction: AutocompleteInteraction<'cached'>): Awaited<void> {
		try {
			const module = container.resolve<Command>(interaction.commandName);
			const focused = interaction.options.getFocused(true);
			module.runAutocomplete(interaction, focused);
		} catch (e) {
			this.client.logger.captureException(e);
		}
	}

	private async parseOptions(
		module: Command,
		options?: readonly CommandInteractionOption[],
		sub?: { group?: string; command?: string }
	) {
		if (!options) return null;

		const args: { [key: string]: unknown } = {};

		for (const option of options) {
			switch (option.type) {
				case ApplicationCommandOptionType.Subcommand:
					args[option.name] = await this.parseOptions(module, option.options, { ...sub, command: option.name });
					break;
				case ApplicationCommandOptionType.SubcommandGroup:
					args[option.name] = await this.parseOptions(module, option.options, { ...sub, group: option.name });
					break;
				default:
					args[option.name] = await this.parseOption(module, option/* , sub */);
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
			case ApplicationCommandOptionType.String: {
				return await this.augmentOption(module, option, sub) ?? option.value;
			}
			case ApplicationCommandOptionType.Channel:
				return option.channel;
			case ApplicationCommandOptionType.User:
				return option.member ?? option.user;
			case ApplicationCommandOptionType.Role:
				return option.role;
			case ApplicationCommandOptionType.Integer:
			case ApplicationCommandOptionType.Boolean:
			case ApplicationCommandOptionType.Number:
			default:
				return option.value;
		}
	}

	private async augmentOption(
		module: Command,
		option: CommandInteractionOption,
		sub?: { group?: string; command?: string }
	): Promise<ModelInstance | null> {
		let base;
		if (sub?.group) {
			base = module.options.find(
				b =>
					b.name === sub.group &&
					b.type === ApplicationCommandOptionType.SubcommandGroup
			)?.options ?? [];
		}
		if (sub?.command) {
			base = (base ?? module.options).find(
				b =>
					b.name === sub.command &&
					b.type === ApplicationCommandOptionType.Subcommand
			)?.options ?? [];
		}
		base = (base ?? module.options).find(b => b.name === option.name);

		if (!base || !base.augmentTo) return null;

		const model = await Models[base.augmentTo].fetch(this.client, `${option.value as string}`);
		return model ?? null;
	}
}
