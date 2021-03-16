import { GuildChannel, Message } from "discord.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";
import { Roles } from "../../util/constants";

interface CommandArgs {
  target: GuildChannel;
}

export default class ResetCommand extends KauriCommand {
  constructor() {
    super("Reset Channel", {
      aliases: ["reset"],
      category: "Admin",
      description: "Resets a channel by cloning it and deleting the original.\nIf no channel is provided, the current channel is targetted.",
      usage: "reset [channel]",
      channel: "guild",
      userRoles: [Roles.Staff]
    });
  }

  public *args(): any {
    const target = yield {
      type: "channel",
      default: (message: Message) => message.channel
    };

    return { target };

  }

  public async exec(message: Message, { target }: CommandArgs) {
    try {
      const clone = await target.clone();
      if (target.parent) { await clone.setParent(target.parent); }
      await clone.setPosition(target.position);
      this.client.logger.prune(message, "all");
      return target.delete();
    } catch (e) {
      this.client.logger.parseError(e);
    }
  }
}
