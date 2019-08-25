import { Schema } from "mongoose";

export interface ITrainerItemDocument {
    itemId: number;
    itemName?: string;
    ref: string;
    count: number;
}

export const TrainerItem = new Schema({
    itemId: { type: Number, required: true, refPath: "ref" },
    itemName: { type: String },
    ref: { type: String, enum: ["Item", "Move"] },
    count: { type: Number, default: 1 },
}, { _id: false });
