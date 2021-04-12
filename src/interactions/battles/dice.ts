import { CommandInteraction } from "discord.js";
import { KauriInteraction } from "../../lib/commands/KauriInteraction";

interface CommandArgs {
  die: string[];
  verify: boolean;
}

export default class extends KauriInteraction {
  constructor() {
    super({
      name: "d",
      description: "Rolls one or more x-sided dice",
      options: [{
        name: "die",
        description: "Die or dice to roll",
        type: "STRING",
        required: true
      }, {
        name: "private",
        description: "Keep this dice roll private [default false]",
        type: "BOOLEAN",
      }],
      guild: true
    });
  }

  public async exec(interaction: CommandInteraction, args: Map<string, any>) {
    const die = args.get("die").split(" ");

    let reduction = true;
    const valid = die.reduce((acc: string[], d: string) => {
      if (/^[1-9]\d*(?:[,d]?[1-9]\d*)?$/.test(d) && reduction)
        acc.push(d);
      else reduction = false;
      return acc;
    }, [] as string[]);

    if (valid.length === 0) return;

    const dice: number[] = valid.flatMap((d: string) => {
      if (!d.match(/[,d]/)) { return parseInt(d, 10); }
      if (/^[1-9]\d*$/.test(d.split(/[,d]/)[0]) && d.split(/[,d]/)[1] !== "") {
        if (/^[1-9]\d*$/.test(d.split(/[,d]/)[0]) && /^[1-9]\d*$/.test(d.split(/[,d]/)[1])) {
          return new Array(parseInt(d.split(/[,d]/)[0], 10)).fill(d.split(/[,d]/)[1]);
        }
      }
    });

    const rolls = dice.map(d => Math.floor(Math.random() * d + 1));

    if (rolls.length === 0) return;

    const response = await interaction.reply(`\\🎲 ${rolls.join(", ")}`, { ephemeral: args.get("private") });

    // DiceLog.log(response.id, interaction, rolls.join(", "));
  }
}
