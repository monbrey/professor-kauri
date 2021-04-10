import { CommandInteraction, MessageEmbed } from "discord.js";
import { KauriInteraction } from "../../lib/commands/KauriInteraction";
import { Eot } from "../../models/mongo/eot";

interface CommandArgs {
  query: string;
}

export default class extends KauriInteraction {
  constructor() {
    super({
      name: "eot",
      description: "Provides End-of-Turn effect information from the Refpedia",
      options: [{
        name: "effect",
        description: "The name of an End of Turn Effect to lookup",
        type: "STRING",
        required: true
      }],
      guild: true
    });
  }

  public async exec(interaction: CommandInteraction, args: Map<string, any>) {
    const query = args.get("effect");

    const effect = await Eot.findClosest("effect", query, 0);
    const surrounding = await Eot.getSurrounding(effect.order);

    const grouped = [];
    for (const e of surrounding) {
      const same = grouped.find(g => g.order === e.order);
      if (same) { same.effect = `${same.effect}, ${e.effect}`; } else { grouped.push(e); }
    }

    const groupString = grouped
      .map(g => {
        const number = `${g.order.toString().includes(".") ? ` ${g.order.toString().split(".")[1]}.` : `${g.order}.`}`;
        return `${number.padEnd(4, " ")}${g.effect}`;
      })
      .join("\n");

    const embed = new MessageEmbed()
      .setTitle(effect.effect)
      .setDescription(`${effect.effect} occurs at position ${effect.order}`)
      .addFields({ name: "**Surrounding Effects**", value: `\`\`\`${groupString}\`\`\`` });

    return interaction.reply(embed);
  }
}
