import { GuildMember } from "discord.js";
import { Event } from "../framework/structures/events/Event";
import { Awaited } from "../typings";

export const data = {
	name: "guildMemberUpdate",
	emitter: "client",
};

export default class GuildMemberUpdateEvent extends Event {
	public exec(oldMember: GuildMember, newMember: GuildMember): Awaited<void> {
		console.log(oldMember, newMember);
	}
}
