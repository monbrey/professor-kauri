import { Message } from "discord.js";
import { Event } from "../framework/structures/events/Event";

export const data = {
	name: "messageUpdate",
	emitter: "client",
};
export default class MessageUpdateEvent extends Event {
	public async exec(oldMessage: Message, newMessage: Message): Promise<void> {
		if (!newMessage.member) return;
		if (newMessage.member.roles.cache.size > 1) return;

		// Mention spam protection
		if (newMessage.mentions.users.size > 5) newMessage.member.ban({ days: 1, reason: "Mention spam from non-member" });

		// Message spam protection
		const count = newMessage.channel.messages.cache.filter(
			m => m.author.id === newMessage.author.id && m.createdTimestamp > Date.now() - 2000,
		).size;
		if (count > 5) newMessage.member.ban({ days: 1, reason: "Message spam from non-member" });
		if (newMessage.channel.isThread() && newMessage.channel.parent?.parentId === "872237702391689249") {
			const pins = await newMessage.channel.messages.fetchPinned();
			if (pins.last()?.id === newMessage.id) { newMessage.channel.send(newMessage.content); }
		}
	}
}
