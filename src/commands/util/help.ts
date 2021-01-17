import { Argument, PrefixSupplier } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";
import CommandBlockedListener from "../../listeners/commandHandler/commandBlocked";
import { stripIndents } from "common-tags";

interface CommandArgs {
  command: KauriCommand;
}

export default class HelpCommand extends KauriCommand {
  public constructor() {
    super("Help", {
      aliases: ["help", "h"],
      category: "Util",
      clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      description: "Provides information about the bot and its commands",
      usage: "help [command]"
    });
  }

  public *args() {
    const command = yield {
      type: Argument.union("command", "commandAlias"),
      unordered: true
    };

    return { command };
  }

  public async exec(message: Message, { command }: CommandArgs) {
    const prefix = (this.handler.prefix as PrefixSupplier)(message);

    if (!command) {
      const embed = new MessageEmbed()
        .setTitle("Professor Kauri")
        .setDescription(stripIndents`Command prefix: \`${prefix}\`
                Report issues or contribute to development on [Github](https://github.com/Monbrey/professor-kauri-v2)

                For additional information on a command, type ${prefix}help <command>`)
        .addFields({ name: "**Commands**", value: "A list of commands available, based on your permission levels" });

      for (const [catId, cat] of this.handler.categories) {
        const cmds = (
          await Promise.all(
            cat.map(async c => {
              const notOwner = !c.ownerOnly;
              const permitted = !(await this.handler.runPermissionChecks(message, c));

              const blockListener = (this.client.listenerHandler.modules.get("commandBlocked") as CommandBlockedListener);
              blockListener.run = false;

              const notInhibited = !(await this.handler.runPostTypeInhibitors(message, c));
              blockListener.run = true;

              return notOwner && permitted && notInhibited ? c : null;
            })
          )
        ).filter(c => c !== null) as KauriCommand[];

        const suffix = message.member!.permissions.has("MANAGE_GUILD", true) ? " (View and Edit)" : " (View)";
        const title = `\\▪ ${catId}${catId === "Config" ? suffix : ""}`;
        if (cmds.length !== 0) embed.addFields({ name: `**${title}**`, value: cmds.map(c => `\`${c.aliases[0]}\``).join(", ") });
      }

      return message.util!.send(embed);
    }

    return message.util!.send(await command.help(message));
  }
}
