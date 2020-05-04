import { Message } from "discord.js";
import { KauriCommand } from "../../../lib/commands/KauriCommand";
import { Move } from "../../../models/mongo/move";

export default class MetronomeCommand extends KauriCommand {
    constructor() {
        super("Metronome", {
            aliases: ["metronome"],
            category: "Game",
            clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
            description: "Select a random move.",
            requiresDatabase: true,
            usage: "metronome"
        });
    }

    public async exec(message: Message) {
        const move = await Move.metronome();
        return message.util!.send(await move.info());
    }
}
