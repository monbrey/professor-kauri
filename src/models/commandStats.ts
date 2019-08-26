import { Document, model, Model, Schema } from "mongoose";
import { autoIncrement } from "mongoose-plugin-autoinc";

export interface ICommandStatsDocument extends Document {
    guild_id: string;
    command_id: string;
    count: number;
}

export interface ICommandStats extends ICommandStatsDocument {
    // instance methods
}

export interface ICommandStatsModel extends Model<ICommandStats> {
    // static methods
}

const CommandStatsSchema = new Schema({
    guild_id: { type: String, required: true },
    command_id: { type: String, required: true },
    count: { type: Number, default: 0 }
});

CommandStatsSchema.plugin(autoIncrement, {
    model: "CommandStats",
    startAt: 1
});

export const CommandStats: ICommandStatsModel =  model<ICommandStats, ICommandStatsModel>("CommandStats", CommandStatsSchema);
