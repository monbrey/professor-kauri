import { Message } from "discord.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";
import { Move } from "../../models/move";

interface CommandArgs {
    query: string;
}

export default class MoveCommand extends KauriCommand {
    constructor() {
        super("move", {
            aliases: ["move"],
            category: "Info",
            description: "Provides Move information",
            clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
        });
    }

    public *args() {
        const query = yield {
            type: "string",
            match: "text",
            prompt: {
                start: "> Please provide the name of an Move to lookup"
            }
        };

        return { query };
    }

    public async exec(message: Message, { query }: CommandArgs) {
        try {
            const move = await Move.findClosest("moveName", query);
            if (move) {
                this.client.logger.move(message, query, move.moveName);
                return message.util!.send(await move.info());
            } else {
                this.client.logger.move(message, query, "none");
                return message.channel.sendPopup("warn", `No results found for ${query}`);
            }
        } catch (e) {
            this.client.logger.parseError(e);
        }
    }
}
