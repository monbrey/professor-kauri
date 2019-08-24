import { Message } from "discord.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";

interface CommandArgs {
    command: KauriCommand;
}

export default class ReloadCommand extends KauriCommand {
    constructor() {
        super("reload", {
            aliases: ["reload"],
            category: "Admin",
            userPermissions: ["ADMINISTRATOR", "MANAGE_GUILD"]
        });
    }

    public *args() {
        const command = yield {
            type: "commandAlias"
        };

        return { command };
    }

    public async exec(message: Message, { command }: CommandArgs) {
        command.reload();

        message.util!.send(`${command.constructor.name} reloaded`);
    }
}
