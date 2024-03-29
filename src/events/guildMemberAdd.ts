import { GuildMember } from "discord.js";
import { Event } from "../framework/structures/events/Event";
import { Awaited } from "../typings";

export const data = {
	name: "guildMemberAdd",
	emitter: "client",
};

export default class GuildMemberAddEvent extends Event {
	public exec(member: GuildMember): Awaited<void> {
		this.client.logger.info({ event: "guildMemberAdd", user_id: member.user.id, name: member.user.username });
	}
}
