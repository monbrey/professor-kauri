import { Message } from "discord.js";
import { KauriCommand } from "../lib/commands/KauriCommand";

export default class TestCommand extends KauriCommand {
    constructor() {
        super("test", {
            aliases: ["test"],
            ownerOnly: true
        });
    }

    public async exec(message: Message) {

    }
}
