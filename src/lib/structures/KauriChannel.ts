import { Message, MessageEmbed, Structures } from 'discord.js';

const EMBED_COLORS: { [index: string]: number } = {
  error: 0xe50000,
  warn: 0xffc107,
  cancel: 0x004a7f,
  success: 0x267f00,
  info: 0xffffff,
};

type EmbedTypes = 'error' | 'warn' | 'cancel' | 'success' | 'info';

declare module 'discord.js' {
  interface TextChannel {
    embed(type: EmbedTypes, description?: string): Promise<Message>;
  }
  interface DMChannel {
    embed(type: EmbedTypes, description?: string): Promise<Message>;
  }
  interface NewsChannel {
    embed(type: EmbedTypes, description?: string): Promise<Message>;
  }
}

Structures.extend('TextChannel', TextChannel => {
  class KauriTextChannel extends TextChannel {
    /**
     * @param {string} type The type of popup to show
     * @param {string} [description] Content for the embed
     * @param {number} [timer] How long to wait to delete the message in milliseconds
     * @returns {Promise<Message>}
     */
    public embed(type: EmbedTypes, description?: string): Promise<Message> {
      if (!type) {
        throw new Error('A popup type must be specified');
      }

      const embed = new MessageEmbed({ color: EMBED_COLORS[type] }).setDescription(description ?? '');

      return this.send({ embeds: [embed] });
    }
  }

  return KauriTextChannel;
});
