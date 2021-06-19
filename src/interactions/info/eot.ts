import { CommandInteraction, MessageEmbed } from 'discord.js';
import { KauriSlashCommand } from '../../lib/commands/KauriSlashCommand';
import { Eot } from '../../models/mongo/eot';

interface CommandArgs {
  query: string;
}

export default class extends KauriSlashCommand {
  constructor() {
    super({
      name: 'eot',
      description: 'Provides End-of-Turn effect information from the Refpedia',
      options: [
        {
          name: 'effect',
          description: 'The name of an End of Turn Effect to lookup',
          type: 'STRING',
          required: true,
        },
      ],
    });
  }

  public async exec(interaction: CommandInteraction, { effect }: Record<string, string>): Promise<void> {
    const value = await Eot.findClosest('effect', effect, 0);
    const surrounding = await Eot.getSurrounding(value.order);

    const grouped = [];
    for (const e of surrounding) {
      const same = grouped.find(g => g.order === e.order);
      if (same) {
        same.effect = `${same.effect}, ${e.effect}`;
      } else {
        grouped.push(e);
      }
    }

    const groupString = grouped
      .map(g => {
        const number = `${g.order.toString().includes('.') ? ` ${g.order.toString().split('.')[1]}.` : `${g.order}.`}`;
        return `${number.padEnd(4, ' ')}${g.effect}`;
      })
      .join('\n');

    const embed = new MessageEmbed()
      .setTitle(value.effect)
      .setDescription(`${value.effect} occurs at position ${value.order}`)
      .addFields({ name: '**Surrounding Effects**', value: `\`\`\`${groupString}\`\`\`` });

    return interaction.reply({ embeds: [embed] });
  }
}
