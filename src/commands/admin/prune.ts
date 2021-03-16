import { Argument } from "discord-akairo";
import { DMChannel, GuildMember, Message } from "discord.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";
import { Roles } from "../../util/constants";

interface CommandArgs {
  count: number;
  user: GuildMember;
}

export default class PruneCommand extends KauriCommand {
  constructor() {
    super("Prune Messages", {
      aliases: ["prune", "purge"],
      category: "Admin",
      description: "Bulk deletes messages from the channel.\nCan be targetted at a specific user.",
      channel: "guild",
      usage: "prune [1-100] [user]",
      userRoles: [Roles.Staff]
    });
  }

  public *args(): any {
    const count = yield {
      type: Argument.range("number", 1, 100),
      default: 100,
      unordered: true
    };

    const user = yield {
      type: "member",
      unordered: true
    };

    return { count, user };

  }

  public async exec(message: Message, { count, user }: CommandArgs) {
    if(message.channel instanceof DMChannel) return;

    const toDelete = user ? message.channel.messages.cache.filter(m => !!m.author && m.author.id === user.id) : count;

    try {
      const deleted = await message.channel.bulkDelete(toDelete, true);
      this.client.logger.prune(message, deleted.size);
    } catch (e) {
      this.client.logger.parseError(e);
    }
    return true;
  }
}
