import { inspect } from 'util';
import { Message, MessageAttachment } from 'discord.js';
import { KauriCommand } from '../../lib/commands/KauriCommand';
import { MessageEmbed } from 'discord.js';
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

			if (evaled === undefined) {
				message.channel.send({ embeds: [new MessageEmbed({ color: 0xffffff, description: "No return value" })] });
				return;
			}

			const stringified = inspect(evaled, { compact: false });

			try {
				message.channel.send({
					files: [new MessageAttachment(Buffer.from(stringified), 'eval.txt')]
				});

			} catch (e) {
				console.error(e);
			}
		} catch (e) {
			console.error(e);
			message.channel.send({
				content: `Fatal execution error in ${this.constructor.name}\n\`\`\`${inspect(e)}\`\`\``,
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
