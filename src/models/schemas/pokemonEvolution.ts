import { Document, Schema } from "mongoose";

export interface IPokemonEvolutionDocument extends Document {
    pokemonId: number;
    exp?: number;
    uniqueName?: string;
    requires?: number;
    trade?: boolean;
}

export const PokemonEvolution = new Schema({
    pokemonId: { type: Number, ref: "Pokemon", required: true },
    exp: { type: Number },
    uniqueName: { type: String },
    requires: { type: Number, ref: "Item" },
    trade: { type: Boolean }
}, { _id: false });
