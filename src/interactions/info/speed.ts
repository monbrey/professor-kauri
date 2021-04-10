import { CommandInteraction, MessageEmbed } from "discord.js";
import { KauriInteraction } from "../../lib/commands/KauriInteraction";
import { CommandExecutionError } from "../../lib/misc/CommandExecutionError";

export default class extends KauriInteraction {
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

  public async exec(interaction: CommandInteraction, args: Map<string, any>) {
    const atkArg: string = args.get("attacker");
    const defArg: string = args.get("defender");

    if (!atkArg)
      throw new CommandExecutionError("Required command parameter 'attacker' not found");
    if (!defArg)
      throw new CommandExecutionError("Required command parameter 'defender' not found");

    const promises = [];
    promises.push(
      !isNaN(parseInt(atkArg)) ?
        Promise.resolve({ name: atkArg, value: parseInt(atkArg) }) :
        this.client.urpg.species.fetchClosest(atkArg).then(s => ({ name: s.value.name, value: s.value.weight }))
    );

    promises.push(
      !isNaN(parseInt(defArg)) ?
        Promise.resolve({ name: defArg, value: parseInt(defArg) }) :
        this.client.urpg.species.fetchClosest(defArg).then(s => ({ name: s.value.name, value: s.value.weight }))
    );

    const [attacker, defender] = await Promise.all(promises);

    const embed = new MessageEmbed()
      .setTitle(`${attacker.name} vs ${defender.name}`)
      .setDescription(`**Attacking Speed**: ${attacker.value}\n**Defending Speed**: ${defender.value}`)
      .addFields([
        { name: "**Electro Ball**", value: `${this.calcElectro(attacker.value, defender.value)} BP`, inline: true },
        { name: "**Gyro Ball**", value: `${this.calcGyro(attacker.value, defender.value)} BP`, inline: true }
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