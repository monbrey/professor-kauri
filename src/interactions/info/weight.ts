import { CommandInteraction, MessageEmbed } from "discord.js";
import { KauriInteraction } from "../../lib/commands/KauriInteraction";
import { CommandExecutionError } from "../../lib/misc/CommandExecutionError";

export default class extends KauriInteraction {
  constructor() {
    super({
      name: "weight",
      description: "Provides information on weight-based moves between one or two Pokemon / weights",
      options: [{
        name: "single",
        description: "Pokemon species to lookup, or numeric weight value",
        type: "STRING",
        required: true
      }, {
        name: "double",
        description: "Pokemon species or weight value to be targetted by weight-based moves",
        type: "STRING"
      }],
    });
  }

  public async exec(interaction: CommandInteraction, args: Map<string, any>) {
    const singleArg: string = args.get("single");
    const doubleArg: string = args.get("double");

    if (!singleArg)
      throw new CommandExecutionError("Required command parameter 'single' not found");

    const promises = [];
    promises.push(
      !isNaN(parseFloat(singleArg)) ?
        Promise.resolve({ name: singleArg, value: parseFloat(singleArg) }) :
        this.client.urpg.species.fetchClosest(singleArg).then(s => ({ name: s.value.name, value: s.value.weight }))
    );

    if (doubleArg) {
      promises.push(
        !isNaN(parseFloat(doubleArg)) ?
          Promise.resolve({ name: doubleArg, value: parseFloat(doubleArg) }) :
          this.client.urpg.species.fetchClosest(doubleArg).then(s => ({ name: s.value.name, value: s.value.weight }))
      );

      // eslint-disable-next-line no-shadow
      const [single, double] = await Promise.all(promises);

      const twoEmbed = new MessageEmbed()
        .setTitle(`${single.name} vs ${double.name}`)
        .setDescription(`Attacking Weight: ${single.value}\nDefending Weight: ${double.value}`)
        .addFields([
          { name: "Heat Crash / Heavy Slam", value: `${this.calcTwo(single.value, double.value)} BP`, inline: true },
          { name: "Grass Knot / Low Kick", value: `${this.calcOne(double.value)} BP`, inline: true }
        ]);

      return interaction.reply(twoEmbed);
    }

    const [single] = await Promise.all(promises);

    const embed = new MessageEmbed()
      .setTitle(`${single.name}`)
      .setDescription(`**Defending Weight**: ${single.value}`)
      .addFields([
        { name: "**Grass Knot / Low Kick**", value: `${this.calcOne(single.value)} BP`, inline: true }
      ]);

    return interaction.reply(embed);
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
