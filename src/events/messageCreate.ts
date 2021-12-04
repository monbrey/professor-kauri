import { Message } from "discord.js";
import { Event } from "../framework/structures/events/Event";
import { Awaited } from "../typings";

export const data = {
	name: "messageCreate",
	emitter: "client",
};
export default class MessageEvent extends Event {
	public exec(message: Message): Awaited<void> {
		if (!message.member || !message.guild) return;

		// Ignore users who have been given the member role
		if (message.member.roles.cache.size > 1) return;

		// Mention spam protection
		if (message.mentions.users.size > 5) {
			message.member.ban({ days: 1, reason: "Mention spam from non-member" });
			this.client.logger.info({
				guild_id: message.guild.id,
				reason: `${message.author.tag} (${message.author.id}) banned for message spam`,
			});
		}

		// Message spam protection
		const count = message.channel.messages.cache.filter(
			m => m.author.id === message.author.id && m.createdTimestamp > Date.now() - 2000,
		).size;
		if (count > 5) {
			message.member.ban({ days: 1, reason: "Message spam from non-member" });
			this.client.logger.info({
				guild_id: message.guild.id,
				reason: `${message.author.tag} (${message.author.id}) banned for message spam`,
			});
		}
	}
}
