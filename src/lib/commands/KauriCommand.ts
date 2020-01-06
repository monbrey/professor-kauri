import { Command, CommandOptions } from "discord-akairo";
import { Message } from "discord.js";
import { Roles } from "../../util/constants";
import { MessageEmbed } from "discord.js";
import { PrefixSupplier } from "discord-akairo";
import { CommandStats } from "../../models/commandStats";

declare module "discord-akairo" {
    interface Command {
        defaults: {
            disabled: boolean;
            configurable: boolean;
        };
        usage?: string | string[]
        userRoles?: Roles[];
    }
}

interface KauriCommandOptions extends CommandOptions {
    defaults?: {
        disabled?: boolean;
        configurable?: boolean;
    };
    usage?: string | string[]
    userRoles?: Roles[];
}

const COMMAND_DEFAULTS = {
    disabled: false,
    configurable: true
};

export class KauriCommand extends Command {
    constructor(id: string, options?: KauriCommandOptions) {
        super(id, options);

        this.defaults = Object.assign({}, COMMAND_DEFAULTS, options ? options.defaults : {});
        this.usage = options?.usage;
        this.userRoles = options?.userRoles;
    }

    public afterCancel?(): any;
    public onBlocked?(message: Message): any;

    public help(message: Message) {
        const prefix = (this.handler.prefix as PrefixSupplier)(message);

        const embed = new MessageEmbed()
            .setTitle(this.id)
            .setDescription(`Command prefix: \`${prefix}\`\nArguments: \`<required>\` | \`[optional]\``)
            .addField("**Aliases**", this.aliases.map(a => `\`${a}\``).join(", "));

        if(this.usage) {
            if(typeof this.usage === "string") embed.addField("**Usage**", `\`${prefix}${this.usage}\``)
            else embed.addField("**Usage**", this.usage.map(u => `\`${prefix}${u}\``).join("\n"))
        }

        return embed;
    }
}
