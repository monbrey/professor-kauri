import { Snowflake } from "discord.js";
import { Document, Schema } from "mongoose";

export interface IStarboardConfigDocument extends Document {
    channel: Snowflake;
    emoji?: string;
    minReacts?: number;
}

export const StarboardConfig = new Schema({
    channel: { type: String, required: true },
    emoji: String,
    minReacts: Number
}, { _id: false });
