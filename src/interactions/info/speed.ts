import { CommandInteraction, MessageEmbed } from "discord.js";
import { KauriSlashCommand } from "../../lib/commands/KauriSlashCommand";
import { CommandExecutionError } from "../../lib/misc/CommandExecutionError";

export default class extends KauriSlashCommand {
  constructor() {
    super({
      name: "speed",
      description: "Provides information on speed-based moves between two Pokemon / speeds",
      options: [{
        name: "attacker",
        description: "Pokemon species or numeric speed value executing speed-based move",
        type: "STRING",
        required: true
      }, {
        name: "defender",
        description: "Pokemon species or numeric speed value to be targetted",
        type: "STRING"
      }],
    });
  }

  public async exec(interaction: CommandInteraction, { attacker, defender }: Record<string, string>) {
    if (!attacker)
      throw new CommandExecutionError("Required command parameter 'attacker' not found");
    if (!defender)
      throw new CommandExecutionError("Required command parameter 'defender' not found");

    const promises = [];
    promises.push(
      !isNaN(parseInt(attacker)) ?
        Promise.resolve({ name: attacker, value: parseInt(attacker) }) :
        this.client.urpg.species.fetchClosest(attacker).then(s => ({ name: s.value.name, value: s.value.weight }))
    );

    promises.push(
      !isNaN(parseInt(defender)) ?
        Promise.resolve({ name: defender, value: parseInt(defender) }) :
        this.client.urpg.species.fetchClosest(defender).then(s => ({ name: s.value.name, value: s.value.weight }))
    );

    const [a, d] = await Promise.all(promises);

    const embed = new MessageEmbed()
      .setTitle(`${a.name} vs ${d.name}`)
      .setDescription(`**Attacking Speed**: ${a.value}\n**Defending Speed**: ${d.value}`)
      .addFields([
        { name: "**Electro Ball**", value: `${this.calcElectro(a.value, d.value)} BP`, inline: true },
        { name: "**Gyro Ball**", value: `${this.calcGyro(a.value, d.value)} BP`, inline: true }
      ]);

    return interaction.reply(embed);
  }

  private calcElectro(attacker: number, defender: number) {
    const percentage = ((defender / attacker) * 100);

    if (percentage > 100 || percentage === 0) return 40;
    if (percentage.between(50.01, 100)) return 60;
    if (percentage.between(33.34, 50)) { return 80; }
    if (percentage.between(25.01, 33.33)) { return 120; }
    if (percentage.between(0.01, 25)) { return 150; }

    return 0;
  }

  private calcGyro(attacker: number, defender: number) {
    if (attacker === 0) return 1;

    return Math.min(150, Math.floor((25 * defender / attacker) + 1));
  }
}