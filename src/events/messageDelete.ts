import { Message, MessageEmbed } from "discord.js";
import { LogChannel } from "../framework/models/LogChannel";
import { Event } from "../framework/structures/events/Event";

export const data = {
	name: "messageCreate",
	emitter: "client",
};

export default class MessageDeleteEvent extends Event {
	public async exec(message: Message): Promise<void> {
		const guildId = message.guild?.id;
		if (!guildId || !message.author) return;

		const config = await LogChannel.fetch(this.client, message.guild.id);
		if (!config) return;

		const logChannel = this.client.channels.cache.get(config.channel_id);
		if (!logChannel || !logChannel.isText()) return;

		const embeds = message.embeds;
		const attachments = message.attachments.map(a => a.proxyURL);

		const embed = new MessageEmbed()
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
			.addField(`• Channel`, `${message.channel}`)
			.setFooter("Message Deleted")
			.setTimestamp();

		if (message.content?.length) {
			embed.addField(`• Message`, message.content);
		}

		if (embeds.length) {
			embed.addField(`• Additional Embeds`, "See below");
		}

		if (attachments.length) {
			embed.addField(`• Attachments`, attachments.join("\n"));
		}

		logChannel.send({ embeds: [embed, ...embeds] });
	}
}
