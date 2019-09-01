import { Message } from "discord.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";
import { Weather } from "../../models/weather";

interface CommandArgs {
    query: string;
}

module.exports = class WeatherCommand extends KauriCommand {
    constructor() {
        super("weather", {
            aliases: ["weather"],
            category: "Info",
            description: "Provides weather information",
            clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],

        });
    }

    public *args() {
        const query = yield {
            type: "string",
            match: "text",
            prompt: {
                start: "> Please provide the name of a Weather Condition to lookup"
            }
        };

        return { query };
    }

    public async exec(message: Message, { query }: CommandArgs) {
        let weather;
        try {
            weather = await Weather.findClosest("shortCode", query, 0.75) || await Weather.findClosest("weatherName", query);
        } catch (e) {
            this.client.logger.parseError(e);
        }

        if (!weather) { return message.util!.embed("warn", `No results found for ${query}`); }
        return message.util!.send(await weather.info());

    }
};
