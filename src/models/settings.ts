import { Document, Model, model, Schema } from "mongoose";

export interface ISettingsSchema extends Document {
    guild_id: string;
    prefix: string;
    starboard: {
        channel: string;
        emoji: string;
        minReacts: number
    };
    logs: string;
}

// tslint:disable-next-line: no-empty-interface
export interface ISettings extends ISettingsSchema {

}

export interface ISettingsModel extends Model<ISettings> {

}

const SettingsSchema: Schema = new Schema({
    guild_id: String,
    prefix: String,
    starboard: {
        channel: String,
        emoji: String,
        minReacts: Number
    },
    logs: String
}, { collection: "settings" });

export const Settings: ISettingsModel = model<ISettings, ISettingsModel>("Settings", SettingsSchema);
