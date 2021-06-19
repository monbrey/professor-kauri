import { CommandInteraction } from 'discord.js';
import { KauriSlashCommand } from '../../lib/commands/KauriSlashCommand';
import { CommandExecutionError } from '../../lib/misc/CommandExecutionError';
import { Ability } from '../../models/mongo/ability';

export default class extends KauriSlashCommand {
  constructor() {
    super({
      name: 'ability',
      description: 'Get Infohub data for an ability',
      options: [
        {
          name: 'ability',
          description: 'Name of the ability to search for',
          type: 'STRING',
          required: true,
        },
      ],
    });
  }

  public async exec(interaction: CommandInteraction, { ability }: Record<string, string>): Promise<void> {
    if (!ability) throw new CommandExecutionError("Command parameter 'ability' not found");

    const value = await Ability.findClosest('abilityName', ability);
    if (!value) throw new CommandExecutionError(`No ability found matching \`${ability}\``);

    this.client.logger.info({
      key: interaction.commandName,
      query: ability,
      result: value.abilityName,
    });

    return interaction.reply({ embeds: [value.info()] });
  }
}
