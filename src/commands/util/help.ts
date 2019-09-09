import { PrefixSupplier } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";
// tslint:disable-next-line: no-var-requires
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
                .setDescription(`Report issues or contribute to development on [Github](https://github.com/Monbrey/professor-kauri-v2)
                Current Version: v${pJson.version}`)
                .addField("Commands", `A list of commands available, based on your permission levels
                For additional information on a command, type ${prefix}help <command>`);

            for (const [catId, cat] of this.handler.categories) {
                const cmds = (await Promise.all(cat.map(async c => !c.ownerOnly && !(await this.handler.runPermissionChecks(message, c)) ? c : null)))
                    .filter(c => c !== null) as KauriCommand[];

                const suffix = message.member!.permissions.has("MANAGE_GUILD", true) ? " (View and Edit)" : " (View)";
                const title = `\\▪ ${catId}${catId === "Config" ? suffix : ""}`;
                if (cmds.length !== 0) embed.addField(title, cmds.map(c => `\`${c.aliases[0]}\``).join(", "));
            }

            return message.util!.send(embed);
        }
    }
}
