import { CommandInteraction } from 'discord.js';
import { KauriSlashCommand } from '../../lib/commands/KauriSlashCommand';
import { CommandExecutionError } from '../../lib/misc/CommandExecutionError';
import { Item } from '../../models/mongo/item';

export default class extends KauriSlashCommand {
  constructor() {
    super({
      name: 'item',
      description: 'Get Infohub data for an item',
      options: [
        {
          name: 'item',
          description: 'Name of the item to search for',
          type: 'STRING',
          required: true,
        },
      ],
    });
  }

  public async exec(interaction: CommandInteraction, { item }: Record<string, string>): Promise<void> {
    if (!item) throw new CommandExecutionError("Command parameter 'item' not found");

    const value = await Item.findClosest('itemName', item);
    if (!value) throw new CommandExecutionError(`No item found matching \`${item}\``);

    this.client.logger.info({
      key: interaction.commandName,
      query: item,
      result: value.itemName,
    });

    return interaction.reply({ embeds: [value.info()] });
  }
}
