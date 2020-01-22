import { Inhibitor } from "discord-akairo";
import { Message } from "discord.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";
import { Roles } from "../../util/constants";

export default class RoleConfigInhibitor extends Inhibitor {
    constructor() {
        super("roleConfigInhibitor", {
            reason: "roles",
            type: "post",
            priority: 2
        });
    }

    public async exec(message: Message, command: KauriCommand): Promise<boolean> {
        if (!message.guild || message.guild.id !== "135864828240592896") return false;

        if (message.author.id === this.client.ownerID) return false;

        if (message.member?.roles.cache.has(Roles.Head)) return false;

        if (command.userRoles) {
            return !command.userRoles.some(r => message.member?.roles.cache.has(r));
        }

        return false;
    }
}
