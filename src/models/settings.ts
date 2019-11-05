import { Document, Model, Schema } from "mongoose";
import { CommandConfig, ICommandConfigDocument } from "./schemas/commandConfig";
import { IStarboardConfigDocument, StarboardConfig } from "./schemas/starboardConfig";
import { instanceDB } from "../util/db";

export interface ISettingsDocument extends Document {
    guild_id: string;
    prefix?: string;
    starboard?: IStarboardConfigDocument;
    logs?: string;
    commands: ICommandConfigDocument[];
}

export interface ISettings extends ISettingsDocument { }

export interface ISettingsModel extends Model<ISettings> { }

const SettingsSchema: Schema = new Schema({
    guild_id: { type: String, required: true },
    prefix: String,
    starboard: StarboardConfig,
    logs: String,
    commands: [CommandConfig]
}, { collection: "settings" });

export const Settings: ISettingsModel = instanceDB.model<ISettings, ISettingsModel>("Settings", SettingsSchema);
