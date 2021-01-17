import { Listener } from "discord-akairo";
import { GuildMember, User } from "discord.js";

export default class GuildMemberRemoveListener extends Listener {
  constructor() {
    super("guildMemberRemove", {
      emitter: "client",
      event: "guildMemberRemove"
    });
  }

  public async exec(member: GuildMember) {
    try {
      const auditLogs = await member.guild.fetchAuditLogs({
        limit: 1
      });

      const lastLog = auditLogs.entries.first();
      if (!lastLog) { return; }

      const target = lastLog.target as User;
      if (target.id === member.id && Date.now() - lastLog.createdTimestamp < 5000) {
        return this.client.logger.guildMemberRemove(member, lastLog);
      } else { return this.client.logger.guildMemberRemove(member); }
    } catch (e) {
      return this.client.logger.parseError(e);
    }
  }
}
