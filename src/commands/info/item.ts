import { Command } from "discord-akairo";
import { Message } from "discord.js";
import { Item } from "../../models/item";

interface CommandArgs {
    query: string;
}

export default class ItemCommand extends Command {
    constructor() {
        super("item", {
            aliases: ["item"],
            category: "Info",
            description: "Provides Item information",
            clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
        });
    }

    public *args() {
        const query = yield {
            type: "string",
            match: "text",
            prompt: {
                start: "> Please provide the name of an Item to lookup"
            }
        };

        return { query };
    }

    public async exec(message: Message, { query }: CommandArgs) {
        try {
            const item = await Item.findClosest("itemName", query);
            if (item) {
                this.client.logger.item(message, query, item.itemName);
                return message.util!.send(item.info());
            } else {
                this.client.logger.item(message, item, "none");
                return message.channel.sendPopup(`No results found for ${item}`);
            }
        } catch (e) {
            this.client.logger.parseError(e);
            return message.channel.sendPopup("error", "Error retrieving Item information");
        }
    }
}
