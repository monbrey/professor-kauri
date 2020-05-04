import { Message } from "discord.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";
import { Move } from "../../models/mongo/move";

interface CommandArgs {
    query: string;
}

export default class MoveCommand extends KauriCommand {
    constructor() {
        super("Move Lookup", {
            aliases: ["move"],
            category: "Info",
            clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
            description: "Provides Move information",
            requiresDatabase: true,
            usage: "move <name>"
        });
    }

    public *args() {
        const query = yield {
            type: "string",
            match: "text",
            prompt: {
                start: "> Please provide the name of a move to lookup"
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
                return message.channel.embed("warn", `No results found for ${query}`);
            }
        } catch (e) {
            this.client.logger.parseError(e);
        }
    }
}
