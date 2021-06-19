import { inspect } from 'util';
import { Message, MessageAttachment } from 'discord.js';
import { KauriCommand } from '../../lib/commands/KauriCommand';
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unused-vars
const Discord = require('discord.js');

interface CommandArgs {
  code: string;
  silent: boolean;
}

export default class extends KauriCommand {
  constructor() {
    super('eval', {
      aliases: ['eval'],
      flags: ['-s'],
      category: 'Util',
      ownerOnly: true,
      defaults: { configurable: false },
    });
  }

  public *args(): any {
    const code = yield {
      match: 'rest',
    };

    const silent = yield {
      match: 'flag',
      flag: '-s',
    };

    return { code, silent };
  }

  public async exec(message: Message, { code, silent }: CommandArgs): Promise<void> {
    try {
      const evaled = await eval(code);

      if (silent) {
        return;
      }

      const stringified = inspect(evaled, { compact: false });

      if (stringified.length >= 2000) {
        await message.util?.send({ files: [new MessageAttachment(Buffer.from(stringified), `${message.id}.txt`)] });
      } else {
        await message.util?.send({ content: this.clean(stringified), code: 'xl' });
      }
    } catch (e) {
      console.error(e);
      message.util?.send({
        content: `Fatal execution error in ${this.constructor.name}\n\`\`\`${inspect(e)}\`\`\``,
        code: 'xl',
      });
    }
  }

  private clean(text: any): string {
    if (typeof text === 'string') {
      return text.replace(/`/g, `\`${String.fromCharCode(8203)}`).replace(/@/g, `@${String.fromCharCode(8203)}`);
    } else {
      return text;
    }
  }
}
