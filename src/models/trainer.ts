
import { Snowflake } from "discord.js";
import { connection, Document, Model, Schema } from "mongoose";
import timestamp from "mongoose-timestamp";

import { BattleRecord, IBattleRecordDocument } from "./schemas/battleRecord";

export interface ICurrency {
    cash?: number;
    cc?: number;
}

export interface ITrainerDocument extends Document {
    _id: Snowflake;
    cash: number;
    cc: number;
    battleRecord: IBattleRecordDocument;
    stats?: string;
    balance: string;
    migrated: boolean;
}

export interface ITrainer extends ITrainerDocument {
    canAfford(amount: ICurrency): boolean;
    modifyBalances(amount: ICurrency): Promise<ITrainer>;
}

export interface ITrainerModel extends Model<ITrainer> {

}

const TrainerSchema = new Schema({
    _id: { type: String, required: true },
    cash: { type: Number, required: true, default: 0 },
    cc: { type: Number, required: true, default: 0 },
    battleRecord: BattleRecord,
    stats: { type: String },
    migrated: { type: Boolean, default: false }
});

TrainerSchema.plugin(timestamp);

TrainerSchema.virtual("balance").get(function(this: ITrainer) {
    return `${this.cash.to$()} | ${this.cc.toCC()}`;
});

TrainerSchema.methods.canAfford = function(amount: ICurrency) {
    const cash = amount.cash && amount.cash < this.cash;
    const cc = amount.cc && amount.cc < this.cc;

    return cash && cc;
};

TrainerSchema.methods.modifyBalances = async function(amount: ICurrency) {
    if (amount.cash) this.cash += amount.cash;
    if (amount.cc) this.cc += amount.cc;
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

const db = connection.useDb(process.env.NODE_ENV || "development");
export const Trainer: ITrainerModel = db.model<ITrainer, ITrainerModel>("Trainer", TrainerSchema);
