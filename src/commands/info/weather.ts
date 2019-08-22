import { Message } from "discord.js";
import KauriCommand from "../../lib/commands/KauriCommand";
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
        const weather = await Weather.findOne({ shortCode: query });

        if (!weather) { return message.util!.sendPopup("warn", `No results found for ${query}`); }

        try {
            return message.util!.send(await weather.info());
        } catch (e) {
            e.key = "weather";
            throw e;
        }
    }
};
