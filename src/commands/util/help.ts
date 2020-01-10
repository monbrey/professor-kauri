import { PrefixSupplier } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";
import { Argument } from "discord-akairo";

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
                .setDescription(`Command prefix: \`${prefix}\`\nReport issues or contribute to development on [Github](https://github.com/Monbrey/professor-kauri-v2)`)
                .addField("**Commands**", "A list of commands available, based on your permission levels")
                .setFooter(`For additional information on a command, type ${prefix}help <command>`);

            for (const [catId, cat] of this.handler.categories) {
                const cmds = (
                    await Promise.all(
                        cat.map(async c => {
                            const notOwner = !c.ownerOnly;
                            const permitted = c.userRoles?.some(p => message.member?.roles.has(p)) ?? true;
                            const notInhibited = !(await this.handler.runPostTypeInhibitors(message, c));

                            return notOwner && permitted && notInhibited ? c : null;
                        })
                    )
                ).filter(c => c !== null) as KauriCommand[];

                const suffix = message.member!.permissions.has("MANAGE_GUILD", true) ? " (View and Edit)" : " (View)";
                const title = `\\▪ ${catId}${catId === "Config" ? suffix : ""}`;
                if (cmds.length !== 0) embed.addField(`**${title}**`, cmds.map(c => `\`${c.aliases[0]}\``).join(", "));
            }

            return message.util!.send(embed);
        }

        return message.util!.send(command.help(message));
    }
}
