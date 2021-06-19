// Import { CommandInteraction, Message, MessageComponentInteraction } from "discord.js";
// import { KauriSlashCommand } from "../../../lib/commands/KauriSlashCommand";
// import { mart, pokemon } from "./components";

// export default class extends KauriSlashCommand {
//   constructor() {
//     super({
//       name: "mart",
//       description: "Browse the Pokemart and make purchases",
//       guild: true
//     });
//   }

//   private async top(interaction: CommandInteraction, sent: Message) {
//     const filter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id;
//     try {
//       const selection = await sent.awaitMessageComponentInteraction(filter, { time: 30000 });

//       if (!selection) throw new Error();
//       switch (selection.customID) {
//         case "pokemon":
//           await selection.update("Select Pokemon to purchase:", { components: pokemon });
//           await this.pokemon(interaction, await selection.fetchReply() as Message);
//           break;
//       }
//     } catch (e) {
//       console.error(e);
//       interaction.deleteReply();
//     }
//   }

//   private async pokemon(interaction: CommandInteraction, sent: Message) {
//     console.log("pokemon");
//     const filter = (i: MessageComponentInteraction) => {
//       console.log(i.user.id, interaction.user.id);
//       return i.user.id === interaction.user.id;
//     };
//     const collector = sent.createMessageComponentInteractionCollector(filter);
//     const selected: string[] = [];

//     collector.on("collect", async (i: MessageComponentInteraction) => {
//       if (!i) throw new Error();
//       switch (i.customID) {
//         case "purchase":
//           await i.update({ components: [] });
//           await i.followUp("Purchase Complete!");
//           break;
//         case "cancel":
//           await i.reply({ content: "Thanks for visiting the Pokemart!", ephemeral: true });
//           await interaction.deleteReply();
//           break;
//         default:
//           if (!i.values) return;
//           selected.push(...i.values);
//           await i.update(`Select Pokemon to purchase:\n - ${selected.join("\n - ")}`);
//       }
//     });
//   }

//   public async exec(interaction: CommandInteraction, args: any) {
//     await interaction.reply("Welcome to the Pokemart! What would you like to browse?", { components: [mart] });
//     const sent = await interaction.fetchReply() as Message;

//     await this.top(interaction, sent);
//   }
// }
