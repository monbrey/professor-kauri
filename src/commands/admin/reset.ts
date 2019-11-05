import { Message } from "discord.js";
import { GuildChannel } from "discord.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";
import { Roles } from "../../util/constants";

interface CommandArgs {
    target: GuildChannel;
}

export default class ResetCommand extends KauriCommand {
    constructor() {
        super("reset", {
            aliases: ["reset"],
            category: "Admin",
            description: "Resets the channel",
            channel: "guild",
            userRoles: [Roles.Staff]
        });
    }

    public *args() {
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
