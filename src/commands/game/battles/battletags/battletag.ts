import { Argument, Flag } from "discord-akairo";
import { KauriCommand } from "../../../../lib/commands/KauriCommand";
import { KauriMessage } from "../../../../lib/structures/KauriMessage";
import { Roles } from "../../../../util/constants";

export default class extends KauriCommand {
  constructor() {
    super("battletag", {
      aliases: ["battletag"],
      category: "Battles",
      description: "Commands for interacting with Battle Tags",
      clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
    });
  }

  public async interact(message: KauriMessage, args: Map<string, any>) {
    const action = args.keys().next().value;
    const arg = await new Argument(this, {
      type: [
        ["battletag-list", "list"],
        ["battletag-add", "add"],
        ["battletag-swap", "swap"],
        ["battletag-schedule", "schedule"],
        ["battletag-clear", "clear"]
      ]
    }).process(message, action);

    if(!arg) return;

    const sub = this.handler.findCommand(arg) as KauriCommand;
    if (sub.interact) {
      sub.interact(message, args.get(action));
    }
  }
}