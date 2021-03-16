import { Message, MessageEmbed } from "discord.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";
import { IWeather, Weather } from "../../models/mongo/weather";

interface CommandArgs {
  query: string;
}

module.exports = class WeatherCommand extends KauriCommand {
  constructor() {
    super("Weather", {
      aliases: ["weather"],
      category: "Info",
      clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      description: "Provides weather information",
      requiresDatabase: true,
      usage: "weather [name]"
    });
  }

  public *args(): any {
    const query = yield {
      type: "string",
      match: "text"
    };

    return { query };
  }

  public async exec(message: Message, { query }: CommandArgs) {
    if (!query) {
      const weathers: IWeather[] = await Weather.find({});
      const list = weathers.map(w => `${this.client.emojis.cache.get(w.emoji) ?? w.emoji} ${w.weatherName} - \`[${w.shortCode}]\``);

      const embed = new MessageEmbed()
        .setTitle("Weather Conditions")
        .setColor(0xFFFFFF)
        .setDescription(`${list.join("\n")}\n\nFor more information on any weather condition, use \`!weather [name/code]\``);

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
