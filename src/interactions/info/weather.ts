import { CommandInteraction, MessageEmbed } from "discord.js";
import { KauriSlashCommand } from "../../lib/commands/KauriSlashCommand";
import { IWeather, Weather } from "../../models/mongo/weather";

export default class extends KauriSlashCommand {
  constructor() {
    super({
      name: "weather",
      description: "Retrieve weather effect information",
      options: [{
        name: "weather",
        description: "Weather effect to look-up",
        type: "INTEGER",
        choices: [
          { "value": 1, "name": "Rain" },
          { "value": 2, "name": "Harsh Sunlight" },
          { "value": 3, "name": "Sandstorm" },
          { "value": 4, "name": "Hail" },
          { "value": 5, "name": "Fog" },
          { "value": 6, "name": "Extremely Harsh Sunlight" },
          { "value": 7, "name": "Heavy Rain" },
          { "value": 8, "name": "Mysterious Air Current" }
        ]
      }],
    });
  }

  public async exec(interaction: CommandInteraction, { weather }: Record<string, number>) {
    if (!weather) {
      const weathers: IWeather[] = await Weather.find({});
      const list = weathers.map(w => `${this.client.emojis.cache.get(w.emoji) ?? w.emoji} ${w.weatherName}`);

      const embed = new MessageEmbed()
        .setTitle("Weather Conditions")
        .setColor(0xFFFFFF)
        .setDescription(`${list.join("\n")}\n\nFor more information on any weather condition, use \`/weather [name]\``);

      return interaction.reply(embed);
    }

    try {
      const thisWeather = await Weather.findById(weather);
      if (!thisWeather) return interaction.reply("No results found", { ephemeral: true });
      return interaction.reply(thisWeather.info(this.client));
    } catch (e) {
      this.client.logger.parseError(e);
    }
  }
}