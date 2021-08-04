import { Models } from "@professor-kauri/framework";
import type { CommandInteraction, CommandInteractionOption, Message, Snowflake } from "discord.js";
import type { Command } from "./Command";
import type { KauriClient } from "../../client/KauriClient";
import type { ModelInstance } from "../../typings";
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
					this.handle(i);
				}
			});
		});
	}

	private async handle(interaction: CommandInteraction): Promise<void | Message | unknown> {
		const module = this.modules.get(interaction.commandName);
		if (!module) {
			return interaction.reply({ content: `\`${interaction.commandName}\` is not yet implemented!`, ephemeral: true });
		}

		const args = await this.parseOptions(module, interaction.options.data);

		try {
			return await module.exec(interaction, args);
		} catch (err) {
			console.error(err);
			// this.client.logger.error(err);
			const method: keyof typeof interaction = interaction.replied ? "editReply" : "reply";
			return interaction[method]({
				content: `[${interaction.commandName}] ${err.message}`,
				ephemeral: true,
			});
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
			console.log(option);
			switch (option.type) {
				case "SUB_COMMAND":
					args[option.name] = await this.parseOptions(module, option.options, { ...sub, command: option.name });
					break;
				case "SUB_COMMAND_GROUP":
					args[option.name] = await this.parseOptions(module, option.options, { ...sub, group: option.name });
					break;
				case "STRING":
					args[option.name] = await this.augmentOption(module, option, sub) ?? option.value;
					break;
				case "CHANNEL":
					args[option.name] = option.channel;
					break;
				case "USER":
					args[option.name] = option.member ?? option.user;
					break;
				case "ROLE":
					args[option.name] = option.role;
					break;
				case "INTEGER":
				case "BOOLEAN":
				default:
					args[option.name] = option.value;
					break;
			}
		}

		return args;
	}

	private async augmentOption(module: Command,
		option: CommandInteractionOption,
		sub?: { group?: string; command?: string }
	): Promise<ModelInstance | null> {
		let base;
		if (sub?.group) {
			base = module.options.find(b => b.name === sub.group && b.type === "SUB_COMMAND_GROUP")?.options ?? [];
		}
		if (sub?.command) {
			base = (base ?? module.options).find(b => b.name === sub.command && b.type === "SUB_COMMAND")?.options ?? [];
		}
		base = (base ?? module.options).find(b => b.name === option.name);

		if (!base || !base.augmentTo) return null;

		const model = await Models[base.augmentTo].fetch(this.client, `${option.value}`);
		return model ?? null;
	}

	public async deploy({ global = true, guild = true } = {}): Promise<this> {
		// eslint-disable-next-line max-len
		const [globalCommands, guildCommands] = this.modules.partition(m => m.global);

		if (global) await this.client.application?.commands.set([...globalCommands.values()]);

		if (guild) {
			const guildId = (process.env.GUILD ?? "135864828240592896") as Snowflake;
			if (!guildId) throw new Error("No guild");
			await this.client.guilds.cache.get(guildId)?.commands.set([...guildCommands.values()]);
		}

		return this;
	}
}
