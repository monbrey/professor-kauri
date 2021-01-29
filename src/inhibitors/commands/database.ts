import { Inhibitor } from "discord-akairo";
import { Message } from "discord.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";
import { InhibitorReasons } from "../../util/constants";

export default class DatabaseConfigInhibitor extends Inhibitor {
  constructor() {
    super("requiresDatabaseInhibitor", {
      reason: InhibitorReasons.NO_DATABASE,
      type: "post",
      priority: 1
    });
  }

  public exec(message: Message, command: KauriCommand): boolean {
    return command.requiresDatabase && this.client.db.main.readyState !== 1;
  }
}
