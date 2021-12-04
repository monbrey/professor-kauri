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
				this.client.logger.info({ event: "guildMemberRemove", user_id: member.user.id, name: member.user.username });
				return;
			}

			const target = lastLog.target as User;
			if (target.id === member.id && Date.now() - lastLog.createdTimestamp < 5000) {
				this.client.logger.info({
					event: "guildMemberRemove",
					user_id: member.user.id,
					name: member.user.username,
					log: { ...lastLog },
				});
			} else {
				this.client.logger.info({ event: "guildMemberRemove", user_id: member.user.id, name: member.user.username });
			}
		} catch (e) {
			this.client.logger.error({ event: "guildMemberRemove", message: e });
		}
	}
}
