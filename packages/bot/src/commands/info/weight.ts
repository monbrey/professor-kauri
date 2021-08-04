// import { Command, KauriModuleOptions } from "@professor-kauri/framework";
// import { CommandInteraction, MessageEmbed } from "discord.js";

// export default class WeightCommand extends Command {
//   constructor(base: KauriModuleOptions) {
//     super(base, {
//       name: "weight",
//       description: "Provides information on weight-based moves between one or two Pokemon / weights",
//       options: [
//         {
//           name: "single",
//           description: "Pokemon species to lookup, or numeric weight value",
//           type: "STRING",
//           required: true,
//         },
//         {
//           name: "double",
//           description: "Pokemon species or weight value to be targetted by weight-based moves",
//           type: "STRING",
//         },
//       ],
//     });
//   }

//   public async exec(interaction: CommandInteraction, { single, double }: Record<string, string>): Promise<void> {
//     if (!single) throw new CommandExecutionError("Required command parameter 'single' not found");

//     const promises = [];
//     promises.push(
//       !isNaN(parseFloat(single))
//         ? Promise.resolve({ name: single, value: parseFloat(single) })
//         : this.client.urpg.species.fetchClosest(single).then(s => ({ name: s.value.name, value: s.value.weight })),
//     );

//     if (double) {
//       promises.push(
//         !isNaN(parseFloat(double))
//           ? Promise.resolve({ name: double, value: parseFloat(double) })
//           : this.client.urpg.species.fetchClosest(double).then(s => ({ name: s.value.name, value: s.value.weight })),
//       );

//       // eslint-disable-next-line no-shadow
//       const [a, b] = await Promise.all(promises);

//       const twoEmbed = new MessageEmbed()
//         .setTitle(`${a.name} vs ${b.name}`)
//         .setDescription(`Attacking Weight: ${a.value}\nDefending Weight: ${b.value}`)
//         .addFields([
//           { name: "Heat Crash / Heavy Slam", value: `${this.calcTwo(a.value, b.value)} BP`, inline: true },
//           { name: "Grass Knot / Low Kick", value: `${this.calcOne(b.value)} BP`, inline: true },
//         ]);

//       return interaction.reply({ embeds: [twoEmbed] });
//     }

//     const [a] = await Promise.all(promises);

//     const embed = new MessageEmbed()
//       .setTitle(`${a.name}`)
//       .setDescription(`**Defending Weight**: ${a.value}`)
//       .addFields([{ name: "**Grass Knot / Low Kick**", value: `${this.calcOne(a.value)} BP`, inline: true }]);

//     return interaction.reply({ embeds: [embed] });
//   }

//   private calcOne(weight: number): number {
//     if (weight.between(0.1, 10)) {
//       return 20;
//     }
//     if (weight.between(10.1, 25)) {
//       return 40;
//     }
//     if (weight.between(25.1, 50)) {
//       return 60;
//     }
//     if (weight.between(50.1, 100)) {
//       return 80;
//     }
//     if (weight.between(100.1, 200)) {
//       return 100;
//     }
//     if (weight >= 200.1) {
//       return 120;
//     }

//     return 0;
//   }

//   private calcTwo(user: number, target: number): number {
//     const ratio = Math.floor(user / target);

//     if (ratio <= 1) {
//       return 40;
//     }
//     if (ratio === 2) {
//       return 60;
//     }
//     if (ratio === 3) {
//       return 80;
//     }
//     if (ratio === 4) {
//       return 100;
//     }
//     if (ratio >= 5) {
//       return 120;
//     }

//     return 0;
//   }
// }
