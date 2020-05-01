
import { Snowflake } from "discord.js";
import { connection, Document, Model, Schema } from "mongoose";
import timestamp from "mongoose-timestamp";

import { BattleRecord, IBattleRecordDocument } from "./schemas/battleRecord";
import { instanceDB } from "../util/db";

export interface ITrainerDocument extends Document {
    _id: Snowflake;
    cash: number;
    battleRecord: IBattleRecordDocument;
    stats?: string;
    migrated: boolean;
}

export interface ITrainer extends ITrainerDocument {
    canAfford(amount: number): boolean;
    pay(amount: number): Promise<ITrainer>;
}

export interface ITrainerModel extends Model<ITrainer> {

}

const TrainerSchema = new Schema({
    _id: { type: String, required: true },
    cash: { type: Number, required: true, default: 0 },
    battleRecord: { type: BattleRecord, default: {} },
    stats: { type: String },
    migrated: { type: Boolean, default: false }
});

TrainerSchema.plugin(timestamp);

TrainerSchema.methods.canAfford = function(amount: number) {
    return amount < this.cash;
};

TrainerSchema.methods.pay = async function(amount: number) {
    this.cash += amount;
    return this.save();
};

// TrainerSchema.methods.populatePokemon = async function() {
//     return await this.populate({
//         path: "pokemon",
//         populate: {
//             path: "basePokemon"
//         }
//     }).execPopulate();
// };

// TrainerSchema.methods.getPokemon = async function(index = null) {
//     if (!this.populated("pokemon")) await this.populatePokemon();
//     return index !== null ? this.pokemon[index] : this.pokemon;
// };

// TrainerSchema.methods.findPokemon = async function(query) {
//     if (!this.populated("pokemon")) await this.populatePokemon();
//     return this.pokemon.filter(p => {
//         return (
//             (p.nickname && new RegExp(`^${query}$`, "i").test(p.nickname)) ||
//             new RegExp(`^${query}$`, "i").test(p.pokemon.uniqueName)
//         );
//     });
// };

// TrainerSchema.methods.listPokemon = async function() {
//     if (!this.populated("pokemon")) await this.populatePokemon();
//     return this.pokemon.map(p => p.nickname || p.pokemon.uniqueName);
// };

// // Adds a new TrainerPokemon for the provided Pokemon ID number
// TrainerSchema.methods.addNewPokemon = async function(pokemon) {
//     const tp = new TrainerPokemon({
//         trainer: this.id,
//         basePokemon: pokemon.id,
//         moves: { ...pokemon.moves },
//         abilities: { ...pokemon.abilities }
//     });

//     for (const method in tp.moves) for (const m of tp.moves[method]) m.learned = false;
//     for (const a of tp.abilities) a.learned = !a.hidden;

//     await tp.save();
//     this.pokemon.push(tp.id);
//     return this.save();
// };

// TrainerSchema.methods.addNewItem = async function(item, type) {
//     this.inventory.push({ item: item.id, itemType: type });
//     return this.save();
// };

export const Trainer: ITrainerModel = instanceDB.model<ITrainer, ITrainerModel>("Trainer", TrainerSchema);
