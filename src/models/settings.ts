import { Document, model, Schema } from "mongoose";

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

const SettingsSchema: Schema = new Schema({
    guild_id: String,
    prefix: String,
    starboard: {
        channel: String,
        emoji: String,
        minReacts: Number
    },
    logs: String
});

export default model<ISettingsSchema>("Settings", SettingsSchema);
