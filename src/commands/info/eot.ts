import { Message, MessageEmbed } from "discord.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";
import { Eot } from "../../models/mongo/eot";

interface CommandArgs {
  query: string;
}

export default class EotCommand extends KauriCommand {
  constructor() {
    super("EOT", {
      aliases: ["eot"],
      category: "Info",
      clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      description: "Provides End-of-Turn effect information from the Refpedia",
      requiresDatabase: true,
      usage: "eot <effect>"
    });
  }

  public *args(): any {
    const query = yield {
      type: "string",
      match: "text",
      prompt: {
        start: "> Please provide the name of an End of Turn Effect to lookup"
      }
    };

    return { query };
  }

  public async exec(message: Message, { query }: CommandArgs) {
    const effect = await Eot.findClosest("effect", query, 0);
    const surrounding = await Eot.getSurrounding(effect.order);

    const grouped = [];
    for (const e of surrounding) {
      const same = grouped.find(g => g.order === e.order);
      if (same) { same.effect = `${same.effect}, ${e.effect}`; } else { grouped.push(e); }
    }

    const groupString = grouped
      .map(g => `${g.order.toString().includes(".") ? " - " : ""}${g.order}. ${g.effect}`)
      .join("\n");

    const embed = new MessageEmbed()
      .setTitle(effect.effect)
      .setDescription(`${effect.effect} occurs at position ${effect.order}`)
      .addFields({ name: "**Surrounding Effects**", value: groupString });

    return message.util!.send(embed);
  }
}
