import { Snowflake } from 'discord.js';
import { Document, Model, Schema } from 'mongoose';
import { instanceDB } from '../../util/db';
import { CommandConfig, ICommandConfigDocument } from '../schemas/commandConfig';
import { IStarboardConfigDocument, StarboardConfig } from '../schemas/starboardConfig';

export interface ISettingsDocument extends Document {
  guild_id: Snowflake;
  prefix?: string;
  starboard?: IStarboardConfigDocument;
  logs?: Snowflake;
  commands: ICommandConfigDocument[];
}

type ISettingsDocumentKey = keyof Omit<ISettingsDocument, keyof Document>;

export interface ISettings extends ISettingsDocument {
  updateProperty(property: ISettingsDocumentKey, data: any): Promise<ISettingsDocument>;
}

export interface ISettingsModel extends Model<ISettings> {}

const SettingsSchema = new Schema<ISettings, ISettingsModel>(
  {
    guild_id: { type: String, required: true },
    prefix: String,
    starboard: StarboardConfig,
    logs: String,
    commands: [CommandConfig],
  },
  { collection: 'settings' },
);

SettingsSchema.methods.updateProperty = async function updateProperty(
  property: ISettingsDocumentKey,
  data: any,
): Promise<ISettingsDocument> {
  this[property] = data;
  await this.save();
  return this;
};

export const Settings: ISettingsModel = instanceDB.model<ISettings, ISettingsModel>('Settings', SettingsSchema);
