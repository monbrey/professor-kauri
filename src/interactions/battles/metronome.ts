import { CommandInteraction } from 'discord.js';
import { KauriSlashCommand } from '../../lib/commands/KauriSlashCommand';
import { Move } from '../../models/mongo/move';

export default class extends KauriSlashCommand {
  constructor() {
    super({
      name: 'metronome',
      description: 'Select a random move',
    });
  }

  public async exec(interaction: CommandInteraction): Promise<void> {
    const move = await Move.metronome();
    return interaction.reply({ embeds: [await move.info()] });
  }
}
