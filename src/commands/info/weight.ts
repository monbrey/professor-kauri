import { Argument } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import { Species } from "urpg.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";

interface CommandArgs {
  query: Species;
  target: Species;
}

module.exports = class WeightCommand extends KauriCommand {
  constructor() {
    super("Weight", {
      aliases: ["weight"],
      category: "Info",
      separator: ",",
      description: "Provides information on weight-based moves for a specific Pokemon, or interaction between two Pokemon",
      usage: ["weight <pokemon>", "weight <attacker>, <target>"],
      clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
    });
  }

  public *args(): any {
    const query = yield {
      type: Argument.union("number", "pokemon"),
      prompt: {
        start: "> Please provide the name of a Pokemon to lookup, or a weight value"
      }
    };

    const target = yield {
      type: Argument.union("number", "pokemon"),
    };

    return {
      query: query.value ?? query,
      target: target?.value ?? target
    };
  }

  public async exec(message: Message, { query, target }: CommandArgs) {
    console.log(query, target);
    const qName = typeof query === "number" ? query : query.name;
    const tName = typeof target === "number" ? target : target?.name;

    if (!qName) {
      this.client.logger.info({ key: "weight", search: message.util?.parsed?.content, result: "none" });
      return;
    }

    const qValue = typeof query === "number" ? query : query.weight;

    this.client.logger.info({
      key: "weight",
      search: message.util?.parsed?.content,
      result: `${qName}${tName ? `and ${tName}` : ""}`
    });

    if (qName && tName) {
      const tValue = typeof target === "number" ? target : target?.weight;

      const twoEmbed = new MessageEmbed()
        .setTitle(`${qName} vs ${tName}`)
        .setDescription(`**Attacking Weight**: ${qValue}\n**Defending Weight**: ${tValue}`)
        .addFields([
          { name: "**Heat Crash / Heavy Slam**", value: `${this.calcTwo(qValue, tValue)} BP`, inline: true },
          { name: "**Grass Knot / Low Kick**", value: `${this.calcOne(tValue)} BP`, inline: true }
        ]);

      return message.util!.send(twoEmbed);
    }

    const embed = new MessageEmbed()
      .setTitle(`${qName}`)
      .setDescription(`**Defending Weight**: ${qValue}`)
      .addFields([
        { name: "**Grass Knot / Low Kick**", value: `${this.calcOne(qValue)} BP`, inline: true }
      ]);

    return message.channel.send(embed);
  }

  private calcOne(weight: number) {
    if (weight.between(0.1, 10)) { return 20; }
    if (weight.between(10.1, 25)) { return 40; }
    if (weight.between(25.1, 50)) { return 60; }
    if (weight.between(50.1, 100)) { return 80; }
    if (weight.between(100.1, 200)) { return 100; }
    if (weight >= 200.1) { return 120; }

    return 0;
  }

  private calcTwo(user: number, target: number) {
    const ratio = Math.floor(user / target);

    if (ratio <= 1) { return 40; }
    if (ratio === 2) { return 60; }
    if (ratio === 3) { return 80; }
    if (ratio === 4) { return 100; }
    if (ratio >= 5) { return 120; }

    return 0;
  }
};
