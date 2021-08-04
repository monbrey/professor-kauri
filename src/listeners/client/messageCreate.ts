import { Listener } from 'discord-akairo';
import { Message } from 'discord.js';

export default class MessageListener extends Listener {
  constructor() {
    super('messageCreate', {
      emitter: 'client',
      event: 'messageCreate',
    });
  }

  public exec(message: Message): Awaited<void> {
    if (!message.member || !message.guild) return;

    // Ignore users who have been given the member role
    if (message.member.roles.cache.size > 1) return;

    // Mention spam protection
    if (message.mentions.users.size > 5) {
      message.member.ban({ days: 1, reason: 'Mention spam from non-member' });
      this.client.logger.major(
        message.guild,
        'Spam protection',
        `${message.author.tag} (${message.author.id}) banned for mention spam`,
      );
    }

    // Message spam protection
    const count = message.channel.messages.cache.filter(
      m => m.author.id === message.author.id && m.createdTimestamp > Date.now() - 2000,
    ).size;
    if (count > 5) {
      message.member.ban({ days: 1, reason: 'Message spam from non-member' });
      this.client.logger.major(
        message.guild,
        'Spam protection',
        `${message.author.tag} (${message.author.id}) banned for message spam`,
      );
    }
  }
}
