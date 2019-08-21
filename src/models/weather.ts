import { MessageEmbed } from "discord.js";
import { Document, model, Model, Schema } from "mongoose";
import { autoIncrement } from "mongoose-plugin-autoinc";

export interface IWeatherDocument extends Document {
    weatherName: string;
    shortCode: string;
    desc: string;
    color: string;
}

export interface IWeather extends IWeatherDocument {
    info(): MessageEmbed;
}

export interface IWeatherModel extends Model<IWeather> {

}

const WeatherSchema = new Schema({
    weatherName: { type: String, required: true },
    shortCode: { type: String, required: true },
    desc: { type: String, required: true },
    color: { type: String, required: true }
}, { collection: "weather" });

WeatherSchema.methods.info = async function() {
    const embed = new MessageEmbed()
        .setTitle(`${this.weatherName}`)
        .setDescription(this.desc)
        .setColor(this.color);

    return embed;
};

export const Weather: IWeatherModel = model<IWeather, IWeatherModel>("Weather", WeatherSchema);
