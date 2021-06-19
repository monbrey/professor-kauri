import { Listener } from 'discord-akairo';
import { GuildMember } from 'discord.js';

export default class GuildMemberAddListener extends Listener {
  constructor() {
    super('guildMemberAdd', {
      emitter: 'client',
      event: 'guildMemberAdd',
    });
  }

  public exec(member: GuildMember): Awaited<void> {
    this.client.logger.guildMemberAdd(member);
  }
}
