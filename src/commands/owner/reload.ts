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
            userPermissions: ["ADMINISTRATOR", "MANAGE_GUILD"],
            ownerOnly: true
        });
    }

    public *args() {
        const command = yield {
            type: "commandAlias"
        };

        return { command };
    }

    public async exec(message: Message, { command }: CommandArgs) {
        if (!(command instanceof KauriCommand)) return;

        command.reload();

        this.client.logger.reload(message, command);
        message.util!.send(`${command.constructor.name} reloaded`);
    }
}
