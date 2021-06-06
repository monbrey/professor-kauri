import { CommandInteraction } from "discord.js";
import { KauriSlashCommand } from "../../lib/commands/KauriSlashCommand";

interface CommandArgs {
  die: string;
  private: boolean;
}

export default class extends KauriSlashCommand {
  constructor() {
    super({
      name: "d",
      description: "Rolls one or more x-sided dice, publicly",
      options: [{
        name: "die",
        description: "Die or dice to roll",
        type: "STRING",
        required: true
      }]
    });
  }

  public async exec(interaction: CommandInteraction, { die, private: priv }: CommandArgs) {
    const dies = (die as string).split(" ");

    let reduction = true;
    const valid = dies.reduce((acc: string[], d: string) => {
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

    const response = await interaction.reply(`\\🎲 ${rolls.join(", ")}`);

    // DiceLog.log(response.id, interaction, rolls.join(", "));
  }
}
