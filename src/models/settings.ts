import { Document, Model, model, Schema } from "mongoose";
import { CommandConfig, ICommandConfigDocument } from "./schemas/commandConfig";
import { IStarboardConfigDocument, StarboardConfig } from "./schemas/starboardConfig";

export interface ISettingsDocument extends Document {
    guild_id: string;
    prefix?: string;
    starboard?: IStarboardConfigDocument;
    logs?: string;
    commands: ICommandConfigDocument[];
}

// tslint:disable-next-line: no-empty-interface
export interface ISettings extends ISettingsDocument {}

export interface ISettingsModel extends Model<ISettings> {}

const SettingsSchema: Schema = new Schema({
    guild_id: { type: String, required: true },
    prefix: String,
    starboard: StarboardConfig,
    logs: String,
    commands: [CommandConfig]
}, { collection: "settings" });

export const Settings: ISettingsModel = model<ISettings, ISettingsModel>("Settings", SettingsSchema);
