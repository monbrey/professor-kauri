import { stripIndents } from 'common-tags';
import { CommandInteraction, GuildMember, MessageEmbed, Role, Snowflake } from 'discord.js';
import { KauriSlashCommand } from '../../lib/commands/KauriSlashCommand';
import { CommandExecutionError } from '../../lib/misc/CommandExecutionError';
import { RoleConfig } from '../../models/mongo/roleConfig';
import { EmbedColors, Roles } from '../../util/constants';

interface CommandArgs {
  action: string;
  member: GuildMember;
  role: Role;
}
export default class extends KauriSlashCommand {
  constructor() {
    super({
      name: 'role',
      description: 'Add or remove a Role from a member',
      options: [
        {
          name: 'action',
          description: 'Action to take: add | remove',
          type: 'STRING',
          choices: [
            { name: 'add', value: 'add' },
            { name: 'remove', value: 'remove' },
          ],
          required: true,
        },
        {
          name: 'member',
          description: 'Guild member to action',
          type: 'USER',
          required: true,
        },
        {
          name: 'role',
          description: 'Role to add or remove',
          type: 'ROLE',
          required: true,
        },
      ],
      guild: true,
      defaultPermission: false,
      permissions: [
        { id: Roles.Approver, type: 'ROLE', permission: true },
        { id: Roles.StaffAlumni, type: 'ROLE', permission: true },
        { id: Roles.MasterTechnician, type: 'ROLE', permission: true },
        { id: Roles.LeadGrader, type: 'ROLE', permission: true },
        { id: Roles.ChiefJudge, type: 'ROLE', permission: true },
        { id: Roles.ElderArbiter, type: 'ROLE', permission: true },
        { id: Roles.EliteRanger, type: 'ROLE', permission: true },
        { id: Roles.ExpertCurator, type: 'ROLE', permission: true },
      ],
    });
  }

  public async exec(
    interaction: CommandInteraction & { guildID: Snowflake },
    { action, member, role }: CommandArgs,
  ): Promise<void> {
    if (!action || !member || !role) throw new CommandExecutionError('Command parameters missing');

    if (!member) throw new CommandExecutionError('Provided user could not be found in the server');

    const config = await RoleConfig.findOne({ role_id: role.id });
    if (!config) {
      throw new CommandExecutionError(
        stripIndents`${role} does not appear to be configured
        [log an issue](https://github.com/monbrey/professor-kauri-v2/issues) to have this resolved`,
      );
    }

    if (!config.parents?.some(r => member.roles.cache.has(r))) {
      throw new CommandExecutionError(`None of your roles are configured to add/remove ${role}`);
    }

    this.client.logger.info({
      key: interaction.commandName,
      action,
      member: member.id,
      role: role.id,
    });

    await (action === 'add' ? member.roles.add(role) : member.roles.remove(role));
    const embed = new MessageEmbed()
      .setDescription(`${role} ${action === 'add' ? 'added to' : 'removed from'} ${member}`)
      .setColor(EmbedColors.SUCCESS);
    return interaction.reply({ embeds: [embed] });
  }
}
