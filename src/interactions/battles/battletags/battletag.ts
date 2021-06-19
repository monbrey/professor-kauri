import { stripIndents } from 'common-tags';
import { CommandInteraction, MessageEmbed, User } from 'discord.js';
import { KauriSlashCommand } from '../../../lib/commands/KauriSlashCommand';
import { CommandExecutionError } from '../../../lib/misc/CommandExecutionError';
import { BattleTag } from '../../../models/mongo/battletag';

interface InteractionArgs extends Record<string, any> {
  subcommand: Record<string, any> & {
    name: FunctionTypes<Omit<BattletagCommand, 'exec'>>;
    options: Record<string, any>;
  };
}

export default class BattletagCommand extends KauriSlashCommand {
  constructor() {
    super({
      name: 'battletag',
      description: 'Commands for interacting with Battle Tags',
      defaultPermission: false,
      options: [
        {
          name: 'add',
          description: 'Assigns a tag to a battler',
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'user',
              description: 'Battler to assign a battle tag',
              type: 'USER',
              required: true,
            },
          ],
        },
        {
          name: 'clear',
          description: 'Clears a scheduled battle',
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'userA',
              description: 'Battler to clear schedule for',
              type: 'USER',
              required: true,
            },
            {
              name: 'userB',
              description: 'Battler to clear schedule for',
              type: 'USER',
              required: true,
            },
          ],
        },
        {
          name: 'list',
          description: 'Lists battle tags',
          type: 'SUB_COMMAND',
        },
        {
          name: 'schedule',
          description: 'Schedule a battle between two users',
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'userA',
              description: 'Battler to schedule with',
              type: 'USER',
              required: true,
            },
            {
              name: 'userB',
              description: 'Battler to schedule with',
              type: 'USER',
            },
          ],
        },
        {
          name: 'swap',
          description: 'Swaps battle tags between two battlers',
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'userA',
              description: 'Winner of the battle',
              type: 'USER',
              required: true,
            },
            {
              name: 'userB',
              description: 'Loser of the battle',
              type: 'USER',
              required: true,
            },
          ],
        },
      ],
    });
  }

  public async add(interaction: CommandInteraction, { user }: Record<string, User>): Promise<void> {
    const battletag = await BattleTag.create({ user: user.id });

    const embed = new MessageEmbed()
      .setFooter('New Battle Tag')
      .setDescription(`Tag #${battletag.tag} issued to ${user}`);

    return interaction.reply({ embeds: [embed] });
  }

  public async clear(interaction: CommandInteraction, { userA, userB }: Record<string, User>): Promise<void> {
    try {
      await BattleTag.clear(userA.id, userB.id);
    } catch (e) {
      const error = new MessageEmbed().setColor('RED').setDescription(e);
      return interaction.reply({ embeds: [error], ephemeral: true });
    }

    const embed = new MessageEmbed()
      .setFooter('Schedule cleared')
      .setDescription(`${userA} and ${userB} are free to challenge again.`);

    return interaction.reply({ embeds: [embed] });
  }

  public async list(interaction: CommandInteraction): Promise<void> {
    const tags = await BattleTag.find({}).sort({ tag: 1 });

    const embed = new MessageEmbed().setTitle('Battle Tag Current Standings').setDescription(
      tags
        .map(t => {
          let line = `**${t.tag}**: <@${t.user}>`;
          if (t.schedule.user && t.schedule.time) {
            line += `\nIn challenge with <@${t.schedule.user}> since ${new Date(t.schedule.time)
              .toISOString()
              .slice(0, 16)
              .replace('T', ' ')}`;
          }
          return line;
        })
        .join('\n'),
    );

    return interaction.reply({ embeds: [embed] });
  }

  public async schedule(interaction: CommandInteraction, { userA, userB }: Record<string, User>): Promise<void> {
    userB = userB ?? interaction.user;

    try {
      await BattleTag.schedule(userA.id, userB.id);
    } catch (e) {
      const error = new MessageEmbed().setColor('RED').setDescription(e);
      return interaction.reply({ embeds: [error], ephemeral: true });
    }

    const embed = new MessageEmbed()
      .setFooter('Battle scheduled')
      .setDescription(`<@${userA}> and <@${userB}> scheduled to battle`);

    return interaction.reply({ embeds: [embed] });
  }

  public async swap(interaction: CommandInteraction, { userA, userB }: Record<string, User>): Promise<void> {
    const battleTags = await BattleTag.swap(userA.id, userB.id);

    const embed = new MessageEmbed().setFooter('Battle Tags swapped').setDescription(
      stripIndents`Tag #${battleTags[0].tag} given to <@${battleTags[0].user}>
        Tag #${battleTags[1].tag} given to <@${battleTags[1].user}>`,
    );

    return interaction.reply({ embeds: [embed] });
  }

  public async exec(interaction: CommandInteraction, { subcommand }: InteractionArgs): Promise<void> {
    if (subcommand.name) await this[subcommand.name](interaction, subcommand.options);
    else throw new CommandExecutionError('No subcommand found [this should never happen]');
  }
}
