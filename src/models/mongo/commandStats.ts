import { Document, Model, Schema } from 'mongoose';
import { instanceDB } from '../../util/db';

export interface ICommandStatsDocument extends Document {
  _id: number;
  guild_id: string;
  command_id: string;
  count: number;
}

export interface ICommandStats extends ICommandStatsDocument {
  // Instance methods
}

export interface ICommandStatsModel extends Model<ICommandStats> {
  // Static methods
}

const CommandStatsSchema = new Schema<ICommandStats, ICommandStatsModel>({
  _id: { type: Number, required: true },
  guild_id: { type: String, required: true },
  command_id: { type: String, required: true },
  count: { type: Number, default: 0 },
});

export const CommandStats: ICommandStatsModel = instanceDB.model<ICommandStats, ICommandStatsModel>(
  'CommandStats',
  CommandStatsSchema,
);
