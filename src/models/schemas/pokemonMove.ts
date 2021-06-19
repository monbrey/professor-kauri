import { Document, Schema } from 'mongoose';

export interface IPokemonMoveDocument extends Document {
  moveId: number;
  moveName: string;
  moveType: string;
  displayName: string;
  tmNumber?: number;
  hmNumber?: number;
}

export const PokemonMove = new Schema(
  {
    moveId: { type: Number, ref: 'Move', required: true },
    moveName: { type: String, required: true },
    moveType: { type: String, required: true },
    displayName: { type: String, required: true },
    tmNumber: { type: Number },
    hmNumber: { type: Number },
  },
  { _id: false },
);
