import { Message } from "discord.js";
import { KauriCommand } from "../../../lib/commands/KauriCommand";
import { DiceLog } from "../../../models/mongo/dicelog";

interface CommandArgs {
  die: string[];
  verify: boolean;
}

export default class DiceCommand extends KauriCommand {
  constructor() {
    super("Dice", {
      aliases: ["dice", "d"],
      category: "Game",
      editable: false,
      flags: ["-v", "--verify"],
      description: "Rolls one or more x-sided dice",
      usage: ["d 100", "d 2,100", "d 2d100"]
    });
  }

  public *args(): any {
    const die = yield {
      type: "string",
      match: "separate"
    };

    return { die };
  }

  public async exec(message: Message, { die, verify }: CommandArgs) {
    let reduction = true;
    const valid = die.reduce((acc, d) => {
      if (/^[1-9]\d*(?:[,d]?[1-9]\d*)?$/.test(d) && reduction)
        acc.push(d);
      else reduction = false;
      return acc;
    }, [] as string[]);

    if (valid.length === 0) return;

    const dice: number[] = valid.flatMap(d => {
      if (!d.match(/[,d]/)) { return parseInt(d, 10); }
      if (/^[1-9]\d*$/.test(d.split(/[,d]/)[0]) && d.split(/[,d]/)[1] !== "") {
        if (/^[1-9]\d*$/.test(d.split(/[,d]/)[0]) && /^[1-9]\d*$/.test(d.split(/[,d]/)[1])) {
          return new Array(parseInt(d.split(/[,d]/)[0], 10)).fill(d.split(/[,d]/)[1]);
        }
      }
    });

    const rolls = dice.map(d => Math.floor(Math.random() * d + 1));

    if (rolls.length === 0) return;

    const response = await message.util!.reply(`\\🎲 ${rolls.join(", ")}`);

    DiceLog.log(response.id, message, rolls.join(", "));
  }
}
