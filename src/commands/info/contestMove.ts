import { Message } from "discord.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";
import { Attack } from "urpg.js";

interface CommandArgs {
  move: Attack;
}

export default class MoveCommand extends KauriCommand {
  constructor() {
    super("Contest Move Lookup", {
      aliases: ["rse", "dppt", "oras"],
      category: "Info",
      clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      description: "Provides Contest Move information",
      usage: [
        "rse <move>",
        "dppt <move>",
        "oras <move>"
      ]
    });
  }

  public *args() {
    const move = yield {
      type: "api-attack",
      match: "text",
      prompt: {
        start: "> Please provide the name of a move to lookup"
      }
    };

    return { move };
  }

  public async exec(message: Message, { move }: CommandArgs) {
    const alias = message.util?.parsed?.alias;

    switch (alias) {
      case "rse": {
        const { name, rseContestAttribute, rseContestMoveType } = move;

      }
        break;
      case "dppt": {
        const { name, dppContestAttribute, dppContestMoveType } = move;

      }
        break;
      case "oras": {
        const { name, orasContestAttribute, orasContestMoveType } = move;

      }
        break;
    }
  }
}
