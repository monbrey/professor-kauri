import { Listener } from "discord-akairo";
import { Message } from "discord.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";

export default class CommandCancelledListener extends Listener {
    constructor() {
        super("commandCancelled", {
            emitter: "commandHandler",
            event: "commandCancelled"
        });
    }

    public async exec(message: Message, command: KauriCommand) {
        if (typeof command.afterCancel === "function") command.afterCancel();
    }
}
