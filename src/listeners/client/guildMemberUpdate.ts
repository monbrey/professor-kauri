import { Listener } from 'discord-akairo';
import { GuildMember } from 'discord.js';

export default class GuildMemberUpdateListener extends Listener {
  constructor() {
    super('guildMemberUpdate', {
      emitter: 'client',
      event: 'guildMemberUpdate',
    });
  }

  public exec(oldMember: GuildMember, newMember: GuildMember): Awaited<void> {
    return this.client.logger.guildMemberUpdate(oldMember, newMember);
  }
}
