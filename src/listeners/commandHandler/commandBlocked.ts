import { Listener } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";
import { InhibitorReasons } from "../../util/constants";

export default class CommandBlockedListener extends Listener {
    public run: boolean = true;

    constructor() {
        super("commandBlocked", {
            emitter: "commandHandler",
            event: "commandBlocked"
        });
    }

    public async exec(message: Message, command: KauriCommand, reason: string) {
        if (!this.run) return;

        if (reason === InhibitorReasons.NO_DATABASE)
            return message.util?.send(new MessageEmbed().setTitle("Unable to run command").setDescription("Required database connection is not currently available"));

        if (typeof command.onBlocked === "function") return command.onBlocked(message);
    }
}
