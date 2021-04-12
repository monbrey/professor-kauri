import { CommandInteraction } from "discord.js";
import { KauriInteraction } from "../../lib/commands/KauriInteraction";
import { Move } from "../../models/mongo/move";

export default class extends KauriInteraction {
  constructor() {
    super({
      name: "metronome",
      description: "Select a random move",
    });
  }

  public async exec(interaction: CommandInteraction) {
    const move = await Move.metronome();
    return interaction.reply(await move.info());
  }
}
