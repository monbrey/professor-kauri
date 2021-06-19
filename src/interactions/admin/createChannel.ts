import { CommandInteraction, GuildChannel } from 'discord.js';
import { KauriSlashCommand } from '../../lib/commands/KauriSlashCommand';
import { Roles } from '../../util/constants';

interface CommandArgs {
  category: GuildChannel;
  name: string;
}
export default class extends KauriSlashCommand {
  constructor() {
    super({
      name: 'create-channel',
      description: 'Create a new channel. Requires content-upkeep role or higher',
      options: [
        {
          name: 'category',
          description: 'Category in which to create the channel, or a sibling channel',
          type: 'CHANNEL',
          required: true,
        },
        {
          name: 'name',
          description: 'Name of the new channel',
          type: 'STRING',
          required: true,
        },
      ],
      guild: true,
      defaultPermission: false,
      permissions: [
        {
          id: Roles.ContentUpkeep,
          type: 'ROLE',
          permission: true,
        },
      ],
    });
  }

  public async exec(interaction: CommandInteraction, { category, name }: CommandArgs): Promise<void> {
    if (!interaction.guild) {
      return interaction.reply({ content: 'This command can only be run in the server', ephemeral: true });
    }

    const parent = category.type === 'category' ? category.id : category.parentID;

    if (!parent) {
      return interaction.reply({
        content: 'Supplied category not found, or supplied channel is not in a category',
        ephemeral: true,
      });
    }

    const channel = await interaction.guild.channels.create(name, { type: 'text', parent });

    return interaction.reply({ content: `New channel ${channel} created`, ephemeral: true });
  }
}
