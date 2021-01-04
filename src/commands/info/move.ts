import { Message } from "discord.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";
import { KauriMessage } from "../../lib/structures/KauriMessage";
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

    public async exec(message: KauriMessage, { query }: CommandArgs) {
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

    public async interact(message: KauriMessage, args: Map<string, any>) {
        const query = args.get("query");

        try {
            const move = await Move.findClosest("moveName", query);

            this.client.logger.info({
                key: message.interaction.name,
                query: args.get("query"),
                result: move.moveName
            });

            // @ts-ignore
            await this.client.api.interactions(message.id)(message.interaction.token).callback.post({
                data: {
                    type: 4,
                    data: {
                        embeds: [(await move.info()).toJSON()]
                    }
                }
            });
        } catch (e) {
            this.client.logger.parseError(e);
        }
    }
}
