import { Listener } from "discord-akairo";
import { Message } from "discord.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";
import { CommandStats } from "../../models/commandStats";

export default class CommandFinishedListener extends Listener {
    constructor() {
        super("commandFinished", {
            emitter: "commandHandler",
            event: "commandFinished"
        });
    }

    public async exec(message: Message, command: KauriCommand) {
        if (process.env.NODE_ENV !== "production") { return; }

        await CommandStats.findOneAndUpdate({ guild_id: message.guild?.id, command_id: command.id }, { $inc: { count: 1 }}, { upsert: true });
    }
}
