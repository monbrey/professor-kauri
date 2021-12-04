import { CommandInteraction } from "discord.js";
import { Constants } from "../../framework";
import { CommandExecutionError } from "../../framework/errors/CommandExecutionError";
import { ArgumentsOf } from "../../framework/structures/commands/ArgumentsOf";
import { Command } from "../../framework/structures/commands/Command";
import { CommandOptionTypes } from "../../typings";

export const data = {
	name: "logs",
	description: "Set the channel for logging output",
	options: [{
		name: "channel",
		description: "Channel to output logs to",
		type: CommandOptionTypes.Channel,
		required: true,
	}],
	defaultPermission: false,
} as const;

export default class LogsCommand extends Command {
	public async exec(interaction: CommandInteraction, args: ArgumentsOf<typeof data>): Promise<void> {
		const db = await this.client.getDatabase();
		if (!db) {
			throw new CommandExecutionError("[LogCommand] Unable to connect to database");
		}

		const guildId = interaction.guildId;
		if (!guildId) {
			throw new CommandExecutionError("[LogCommand] This command must be run in a server");
		}

		const channelId = args.channel.id;
		if (!channelId) {
			throw new CommandExecutionError("[LogCommand] No channel option provided.");
		}

		const logChannels = db.collection("logChannels");

		try {
			await logChannels.findOneAndReplace(
				{ guild_id: guildId, channel_id: channelId },
				{ guild_id: guildId, channel_id: channelId },
				{ upsert: true }
			);
			await interaction.reply({ content: "Log channel configured", ephemeral: true });
		} catch (err) {
			console.error(err);
			throw new CommandExecutionError(`[LogCommand] Error writing to database: ${err}`);
		}
	}
}
