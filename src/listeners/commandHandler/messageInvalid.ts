import { Listener } from 'discord-akairo';
import { Message } from 'discord.js';
import { KauriClient } from '../../lib/KauriClient';

export default class extends Listener {
  constructor() {
    super('messageInvalid', {
      emitter: 'commandHandler',
      event: 'messageInvalid',
    });
  }

  public async exec(message: Message): Promise<void> {
    if (!message.util?.parsed) return;
    const { prefix, alias } = message.util.parsed;

    if (prefix === '!' && alias) {
      const interaction = (this.client as KauriClient).interactionHandler.findCommand(alias);
      if (interaction) {
        await message.reply(
          `The \`${prefix}${alias}\` command has been migrated to a Slash Command! Try it out with \`/${alias}\``,
        );
      }
    }
  }
}
