import { Message } from "discord.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";
import { Move } from "../../models/move";

export default class MetronomeCommand extends KauriCommand {
    constructor() {
        super("metronome", {
            aliases: ["metronome"],
            category: "Game",
            description: "Select a random move",
            clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"]
        });
    }

    public async exec(message: Message) {
        const move = await Move.metronome();
        return message.util!.send(await move.info());
    }
}
