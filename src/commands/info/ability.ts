import { Command } from "discord-akairo";
import { Message } from "discord.js";
import { Ability } from "../../models/ability";

interface AbilityArgs {
    query: string;
}

export default class AbilityCommand extends Command {
    constructor() {
        super("ability", {
            aliases: ["ability"],
            category: "Info",
            description: "Provides information on Pokemon Abilities",
            clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
        });
    }

    public *args() {
        const query = yield {
            type: "string",
            match: "text",
            prompt: {
                start: "> Please provide the name of an ability to lookup:"
            }
        };

        return { query };
    }

    public async exec(message: Message, { query }: AbilityArgs) {
        try {
            const ability = await Ability.findClosest("abilityName", query);
            if (ability) {
                this.client.logger.ability(message, query, ability.abilityName);
                return message.util!.send(ability.info());
            } else {
                this.client.logger.ability(message, query, "none");
                return message.channel.sendPopup("warn", `No results found for ${query}`);
            }
        } catch (e) {
            this.client.logger.parseError(e);
        }
    }
}
