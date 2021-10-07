import { GuildMember, User } from "discord.js";
import { Event } from "../framework/structures/events/Event";

export const data = {
	name: "guildMemberRemove",
	emitter: "client",
};

export default class GuildMemberRemoveEvent extends Event {
	public async exec(member: GuildMember): Promise<void> {
		try {
			const auditLogs = await member.guild.fetchAuditLogs({
				limit: 1,
			});

			const lastLog = auditLogs.entries.first();
			if (!lastLog) {
				return;
			}

			const target = lastLog.target as User;
			if (target.id === member.id && Date.now() - lastLog.createdTimestamp < 5000) {
				console.log(member, lastLog);
			} else {
				console.log(member);
			}
		} catch (e) {
			console.error(e);
		}
	}
}
