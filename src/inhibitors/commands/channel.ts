import { Inhibitor } from "discord-akairo";
import { Message } from "discord.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";

export default class CommandChannelDisabled extends Inhibitor {
    constructor() {
        super("commandChannelDisabled", {
            reason: "commandChannelDisabled",
            type: "post",
            priority: 1
        });
    }

    public async exec(message: Message, command: KauriCommand): Promise<boolean> {
        if (message.author.id === this.client.ownerID) return true;

        if (!message.guild) { return false; }

        const guildConf = this.client.settings.get(message.guild.id);
        if (!guildConf) { return false; }

        const commandConf = guildConf.commands.find(c => c.command === command.id);
        if (!commandConf) { return false; }

        const commandChannelConf = commandConf.channels.find(c => c.channel_id === message.channel.id);
        if (!commandChannelConf) { return false; }

        return commandChannelConf.disabled;
    }
}
