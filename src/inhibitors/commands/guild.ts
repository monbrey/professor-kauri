import { Inhibitor } from "discord-akairo";
import { Command } from "discord-akairo";
import { Message } from "discord.js";
import { ICommandConfigDocument } from "../../models/schemas/commandConfig";

export default class CommandGuildDisabled extends Inhibitor {
    constructor() {
        super("commandGuildDisabled", {
            reason: "commandGuildDisabled",
            type: "post",
            priority: 0
        });
    }

    public async exec(message: Message, command: Command): Promise<boolean> {
        if (!message.guild) { return false; }

        const guildCommandConfigs = this.client.settings.get(message.guild.id, "commands") as ICommandConfigDocument[];
        if (!guildCommandConfigs) { return command.defaults.disabled; }

        const commandConf = guildCommandConfigs.find(c => c.command === command.id);
        return commandConf ? commandConf.disabled : command.defaults.disabled;
    }
}