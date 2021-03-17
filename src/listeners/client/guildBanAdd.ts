import { Listener } from "discord-akairo";
import { Guild, User } from "discord.js";

export default class GuildBanAddListener extends Listener {
  constructor() {
    super("guildBanAdd", {
      emitter: "client",
      event: "guildBanAdd"
    });
  }

  public exec(guild: Guild, user: User) {
    const audit = guild.fetchAuditLogs({
      type: "MEMBER_BAN_ADD",
      user
    });
  }
}
