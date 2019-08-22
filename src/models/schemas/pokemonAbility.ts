import { Document, Schema } from "mongoose";

export interface IPokemonAbilityDocument extends Document {
    abilityId: number;
    abilityName: string;
    hidden?: boolean;
}

export const PokemonAbility = new Schema({
    abilityId: { type: Number, ref: "Ability", required: true },
    abilityName: { type: String, required: true },
    hidden: Boolean
}, { _id: false });
