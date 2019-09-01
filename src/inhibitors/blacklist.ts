import { Inhibitor } from "discord-akairo";
import { Message } from "discord.js";

export default class BlacklistInhibitor extends Inhibitor {
    constructor() {
        super("blacklist", {
            reason: "blacklist"
        });
    }

    public async exec(message: Message): Promise<boolean> {
        const blacklist: string[] = [];

        if (message.author) {
            return blacklist.includes(message.author.id);
        }
        return false;
    }
}
