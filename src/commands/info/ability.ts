import { Message } from "discord.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";
import { Ability } from "../../models/ability";

interface CommandArgs {
    query: string;
}

export default class AbilityCommand extends KauriCommand {
    constructor() {
        super("Ability Lookup", {
            aliases: ["ability"],
            category: "Info",
            description: "Provides information on Pokemon Abilities",
            usage: "ability <name>",
            clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
        });
    }

    public *args() {
        const query = yield {
            type: "string",
            match: "text",
            prompt: {
                start: "> Please provide the name of an Ability to lookup"
            }
        };

        return { query };
    }

    public async exec(message: Message, { query }: CommandArgs) {
        try {
            const ability = await Ability.findClosest("abilityName", query);
            if (ability) {
                this.client.logger.ability(message, query, ability.abilityName);
                return message.util!.send(ability.info());
            } else {
                this.client.logger.ability(message, query, "none");
                return message.channel.embed("warn", `No results found for ${query}`);
            }
        } catch (e) {
            this.client.logger.parseError(e);
        }
    }
}
