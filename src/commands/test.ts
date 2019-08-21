import { Command } from "discord-akairo";
import { Message } from "discord.js";

export default class TestCommand extends Command {
    constructor() {
        super("test", {
            aliases: ["test"],
            ownerOnly: true
        });
    }

    public async exec(message: Message) {

    }
}
