import { Command, Inhibitor } from 'discord-akairo';
import { Message } from 'discord.js';
import { ICommandConfigDocument } from '../../models/schemas/commandConfig';

export default class GuildConfigInhibitor extends Inhibitor {
  constructor() {
    super('guildConfigInhibitor', {
      reason: 'Command disabled in guild',
      type: 'post',
      priority: 0,
    });
  }

  public exec(message: Message, command: Command): Awaited<boolean> {
    if (message.author.id === this.client.ownerID) return false;

    if (!message.guild) {
      return false;
    }

    const guildCommandConfigs = this.client.settings?.get(message.guild.id)?.commands as ICommandConfigDocument[];
    if (!guildCommandConfigs) {
      return command.defaults.disabled;
    }

    const commandConf = guildCommandConfigs.find(c => c.command === command.id);
    return commandConf ? commandConf.disabled : command.defaults.disabled;
  }
}
