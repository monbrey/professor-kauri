import { Document, Schema } from "mongoose";

export interface IBattleRecordDocument extends Document {
    wins: number;
    losses: number;
    ffas: number;
    elo: number;
}

export const BattleRecord = new Schema({
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    ffas: { type: Number, default: 0 },
    elo: { type: Number }
}, { _id: false });
