import { CommandInteraction } from 'discord.js';
import { KauriSlashCommand } from '../../lib/commands/KauriSlashCommand';
import { CommandExecutionError } from '../../lib/misc/CommandExecutionError';
import { Pokemon } from '../../models/Pokemon';

export default class extends KauriSlashCommand {
  constructor() {
    super({
      name: 'learnset',
      description: 'Get the movelist for a Pokemon',
      options: [
        {
          name: 'species',
          description: 'Name of the Pokemon to search for',
          type: 'STRING',
          required: true,
        },
      ],
    });
  }

  public async exec(interaction: CommandInteraction, { species }: Record<string, string>): Promise<void> {
    if (!species) throw new CommandExecutionError("Command parameter 'species' not found");

    const arg = await this.client.urpg.species.fetchClosest(species);
    const pokemon = new Pokemon(arg.value);

    if (!arg) throw new CommandExecutionError(`No Pokemon found matching \`${species}\``);

    this.client.logger.info({
      key: interaction.commandName,
      query: species,
      result: pokemon.name,
    });

    return interaction.reply({ embeds: [await pokemon.learnset(species, arg.rating)] });
  }
}
