import { Listener } from "discord-akairo";
import { Message } from "discord.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";

export default class CommandBlockedListener extends Listener {
    constructor() {
        super("commandBlocked", {
            emitter: "commandHandler",
            event: "commandBlocked"
        });
    }

    public async exec(message: Message, command: KauriCommand, reason: string) {
        if (typeof command.onBlocked === "function") command.onBlocked(message);
    }
}
