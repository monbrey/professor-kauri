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

type ISettingsDocumentKey = keyof Omit<ISettingsDocument, keyof Document>;

export interface ISettings extends ISettingsDocument {
  updateProperty(property: ISettingsDocumentKey, data: any): ISettingsDocument;
}

export interface ISettingsModel extends Model<ISettings> { }

const SettingsSchema: Schema = new Schema({
  guild_id: { type: String, required: true },
  prefix: String,
  starboard: StarboardConfig,
  logs: String,
  commands: [CommandConfig]
}, { collection: "settings" });

SettingsSchema.methods.updateProperty = async function (property: ISettingsDocumentKey, data: any): Promise<ISettingsDocument> {
  this[property] = data;
  return this.save();
};

export const Settings: ISettingsModel = instanceDB.model<ISettings, ISettingsModel>("Settings", SettingsSchema);
