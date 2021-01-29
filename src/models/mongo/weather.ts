import { Client, MessageEmbed } from "discord.js";
import { Document, Model, Schema } from "mongoose";
import { db } from "../../util/db";

export interface IWeatherDocument extends Document {
  _id: number;
  weatherName: string;
  shortCode: string;
  desc: string;
  color: string;
  emoji: string;
}

export interface IWeather extends IWeatherDocument {
  info(client: Client): MessageEmbed;
}

export interface IWeatherModel extends Model<IWeather> {

}

const WeatherSchema = new Schema<IWeather, IWeatherModel>({
  _id: { type: Number, required: true },
  weatherName: { type: String, required: true },
  shortCode: { type: String, required: true },
  desc: { type: String, required: true },
  color: { type: String, required: true },
  emoji: { type: String }
}, { collection: "weather" });

WeatherSchema.methods.info = function(client: Client) {
  const embed = new MessageEmbed()
    .setTitle(`${client.emojis.cache.get(this.emoji) ?? this.emoji} ${this.weatherName}`)
    .setDescription(this.desc)
    .setColor(this.color);

  return embed;
};

export const Weather: IWeatherModel = db.model<IWeather, IWeatherModel>("Weather", WeatherSchema);
