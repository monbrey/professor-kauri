import { Message } from "discord.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";
import { Weather } from "../../models/weather";
import { MessageEmbed } from "discord.js";

interface CommandArgs {
    query: string;
}

module.exports = class WeatherCommand extends KauriCommand {
    constructor() {
        super("Weather", {
            aliases: ["weather"],
            category: "Info",
            description: "Provides weather information",
            usage: "weather [name]",
            clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
        });
    }

    public *args() {
        const query = yield {
            type: "string",
            match: "text"
        };

        return { query };
    }

    public async exec(message: Message, { query }: CommandArgs) {
        if (!query) {
            const weathers = await Weather.find({});
            const list = weathers.map(w => `${this.client.emojis.get(w.emoji) ?? w.emoji} ${w.weatherName} - \`[${w.shortCode}]\``);

            const embed = new MessageEmbed()
            .setTitle("Weather Conditions")
            .setColor(0xFFFFFF)
            .setDescription(`${list.join('\n')}\n\nFor more information on any weather condition, use \`!weather [name/code]\``);

            return message.util?.send(embed);
        }

        try {
            const weather = await Weather.findClosest("shortCode", query, 0.75) || await Weather.findClosest("weatherName", query);
            if (!weather) { return message.util!.embed("warn", `No results found for ${query}`); }
            return message.util?.send(weather.info(this.client));
        } catch (e) {
            this.client.logger.parseError(e);
        }
    }
};
