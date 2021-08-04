import { oneLine, stripIndents } from 'common-tags';
import { CommandInteraction, GuildChannel, Snowflake } from 'discord.js';
import { KauriSlashCommand } from '../../lib/commands/KauriSlashCommand';
import { CommandExecutionError } from '../../lib/misc/CommandExecutionError';
import { Roles } from '../../util/constants';

interface InteractionArgs extends Record<string, any> {
  subcommand: Record<string, any> & {
    name: FunctionTypes<Omit<ManageInteraction, 'exec'>>;
    options: Record<string, any>;
  };
}

export default class ManageInteraction extends KauriSlashCommand {
  constructor() {
    super({
      name: 'manage',
      description: 'Manage Slash Commands',
      defaultPermission: false,
      options: [
        {
          name: 'commands',
          description: 'Manage commands',
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'action',
              description: 'Endpoint to call',
              required: true,
              type: 'STRING',
              choices: [
                { name: 'Load', value: 'load' },
                { name: 'Reload', value: 'reload' },
                { name: 'Set Perms', value: 'updatePermissions' },
                { name: 'Delete', value: 'delete' },
              ],
            },
            {
              name: 'command',
              description: 'Command to be actioned',
              required: true,
              type: 'STRING',
            },
          ],
        },
        {
          name: 'logs',
          description: 'View or manage the configured logging channel',
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'channel',
              description: 'Set the channel to write logs to',
              type: 'CHANNEL',
            },
          ],
        },
        {
          name: 'starboard',
          description: 'View or manage the configured starboard channel',
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'channel',
              description: 'Set the channel to write logs to',
              type: 'CHANNEL',
            },
            {
              name: 'emoji',
              description: 'Set the emoji to listen for',
              type: 'STRING',
            },
            {
              name: 'threshold',
              description: 'Set the number of reactions required',
              type: 'INTEGER',
            },
          ],
        },
      ],
      permissions: [
        {
          id: '122157285790187530',
          type: 'USER',
          permission: true,
        },
        {
          id: Roles.Staff,
          type: 'ROLE',
          permission: true,
        },
      ],
      guild: true,
    });
  }

  public async commands(interaction: CommandInteraction, { action, command }: Record<string, string>): Promise<void> {
    const cmd = this.handler.modules.get(command) as KauriSlashCommand | undefined;

    if (!cmd) {
      if (command === 'ALL' && action === 'reload') {
        await this.handler.setAll();
        return interaction.reply({
          content: stripIndents`All Slash Command configurations have been overwritten.
            Some commands may take up to an hour for changes to appear.`,
          ephemeral: true,
        });
      } else if (command === 'ALL_PERMISSIONS' && action === 'reload') {
        await this.handler.setAllPermissions();
        return interaction.reply({ content: 'All Slash Command permissions have been overwritten.', ephemeral: true });
      } else {
        return interaction.reply({ content: `No command matching '${command}' found`, ephemeral: true });
      }
    }

    switch (action) {
      case 'load':
        await cmd.create();
        return interaction.reply({ content: `Command '${command}' loaded`, ephemeral: true });
      case 'reload':
        await cmd.edit();
        return interaction.reply({ content: `Command '${command}' reloaded`, ephemeral: true });
      case 'bulk':
        await this.handler.setAll();
        return interaction.reply({ content: 'All commands reloaded', ephemeral: true });
      case 'delete':
        await cmd.delete();
        return interaction.reply({ content: `Command '${command}' deleted`, ephemeral: true });
      case 'updatePermissions':
        await cmd.updatePermissions();
        return interaction.reply({ content: `Permissions set for '${command}'`, ephemeral: true });
      default:
        return interaction.reply({ content: `No action matching '${action}' found`, ephemeral: true });
    }
  }

  public async logs(
    interaction: CommandInteraction,
    { channel }: Record<string, GuildChannel | undefined>,
  ): Promise<void> {
    if (!interaction.guild) {
      return interaction.reply({ content: 'This command is not available in DMs', ephemeral: true });
    }

		const logChannel = this.client.settings?.get(this.id)?.logs ?? null;
    if (!channel && !logChannel) {
      return interaction.reply({ content: 'No logging channel configured', ephemeral: true });
    }
    if (!channel) {
      return interaction.reply({
        content: `Logs are currently being output to <#${logChannel}>`,
        ephemeral: true,
      });
    }

    await this.client.settings?.get(interaction.guild.id)?.updateProperty('logs', channel.id);
    return interaction.reply({ content: `Logs will now be output to ${channel}`, ephemeral: true });
  }

  public async starboard(
    interaction: CommandInteraction,
    { channel, emoji, threshold }: Record<string, any>,
  ): Promise<void> {
    if (!interaction.guild) {
      return interaction.reply({ content: 'This command is not available in DMs', ephemeral: true });
    }

		const starboard = this.client.settings?.get(this.id)?.starboard ?? null;
    if (!starboard) {
      return interaction.reply({ content: 'No starboard channel configured', ephemeral: true });
    }

    const { channel: setChannel, emoji: setEmoji, minReacts: setThreshold } = starboard;
    if (!channel && !emoji && !threshold) {
      // eslint-disable-next-line no-shadow
      const _emoji = interaction.guild.emojis.cache.get(setEmoji as Snowflake) ?? setEmoji ?? '⭐';
      return interaction.reply({
        content: `Messages which receive ${setThreshold} x\\${_emoji} reactions will be logged to <#${setChannel}>`,
        ephemeral: true,
      });
    }

    const newSettings = {
      channel: channel?.id ?? starboard.channel,
      emoji:
        emoji ??
        interaction.guild.emojis.cache.get(starboard.emoji as Snowflake)?.id ??
        starboard.emoji,
      minReacts: threshold ?? starboard.minReacts ?? 3,
    };
    await this.client.settings?.get(interaction.guild.id)?.updateProperty('starboard', newSettings);

    return interaction.reply({
      content: stripIndents`Starboard configuration has been updated.
      ${oneLine`Messages which receive ${newSettings.minReacts} x\\${newSettings.emoji} reactions
      will be logged to <#${newSettings.channel}>`}`,
      ephemeral: true,
    });
  }

  public async exec(interaction: CommandInteraction, { subcommand }: InteractionArgs): Promise<void> {
    if (subcommand.name) await this[subcommand.name](interaction, subcommand.options);
    else throw new CommandExecutionError('No subcommand found [this should never happen]');
  }
}
