import { stripIndents } from "common-tags";
import { PrefixSupplier } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";
const pJson = require("../../../package.json");

interface CommandArgs {
    command: KauriCommand;
}

export default class HelpCommand extends KauriCommand {
    public constructor() {
        super("help", {
            aliases: ["help", "h"],
            category: "Util",
            description: "Provides information about the bot and its commands",
            clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"]
        });
    }

    public *args() {
        const command = yield {
            type: "command",
            unordered: true
        };

        return { command };
    }

    public async exec(message: Message, { command }: CommandArgs) {
        const prefix = (this.handler.prefix as PrefixSupplier)(message);
        if (!command) {
            const embed = new MessageEmbed()
                .setAuthor("Professor Kauri", undefined, "https://github.com/Monbrey/professor-kauri-v2")
                .setDescription(stripIndents`Report issues or contribute to development on [Github](https://github.com/Monbrey/professor-kauri-v2)
                Current Version: v${pJson.version}`)
                .addField("Commands", stripIndents`A list of commands available, based on your permission levels`);
                //  For additional information on a command, type ${prefix}help <command>`);

            for (const [catId, cat] of this.handler.categories) {
                const cmds = (
                    await Promise.all(
                        cat.map(async c => {
                            const notOwner = !c.ownerOnly;
                            const permitted = !(await this.handler.runPermissionChecks(message, c));
                            const notInhibited = !(await this.handler.runPostTypeInhibitors(message, c));

                            return notOwner && permitted && notInhibited ? c : null;
                        })
                    )
                ).filter(c => c !== null) as KauriCommand[];

                const suffix = message.member!.permissions.has("MANAGE_GUILD", true) ? " (View and Edit)" : " (View)";
                const title = `\\▪ ${catId}${catId === "Config" ? suffix : ""}`;
                if (cmds.length !== 0) embed.addField(title, cmds.map(c => `\`${c.aliases[0]}\``).join(", "));
            }

            return message.util!.send(embed);
        }
    }
}
