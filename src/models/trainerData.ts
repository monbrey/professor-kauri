import { connection, Document, Model, Schema } from "mongoose";
import timestamp from "mongoose-timestamp";

import { IItem } from "./item";
import { IPokemon } from "./pokemon";
import { ITrainerItemDocument, TrainerItem } from "./schemas/trainerItem";
import { instanceDB } from "../util/db";

export interface ITrainerDataDocument extends Document {
    _id: string;
    cash: string;
    contestCredit: number;
    battleRecord: {
        wins: number;
        losses: number;
        ffas: number;
        elo: number;
    };
    stats?: string;
    canRestart: boolean;
    admin: boolean;
    active: boolean;
    inventory: ITrainerItemDocument[];
    balance: { cash: number; contestCredit: number };
    balanceString: string;
}

export interface ITrainerData extends ITrainerDataDocument {
    cantAfford(cash?: number, contestCredit?: number): boolean;
    modifyCash(amount: number): ITrainerData;
    modifyContestCredit(amount: number): ITrainerData;
    populatePokemon(): ITrainerData;
    getPokemon(index?: number): IPokemon | IPokemon[];
    findPokemon(query: string): IPokemon;
    listPokemon(): string[];
    addNewItem(item: IItem, type: string): ITrainerData;
}

export interface ITrainerDataModel extends Model<ITrainerData> {
    // static methods
}

const TrainerSchema = new Schema({
    _id: { type: String, required: true },
    cash: { type: Number, required: true, default: 0 },
    contestCredit: { type: Number, required: true, default: 0 },
    battleRecord: {
        wins: { type: Number, default: 0 },
        losses: { type: Number, default: 0 },
        ffas: { type: Number, default: 0 },
        elo: { type: Number, default: 1500 }
    },
    ffaPing: { type: Boolean, default: false },
    stats: { type: String },
    canRestart: { type: Boolean, default: false },
    admin: { type: Boolean, default: false },
    active: { type: Boolean, required: true, default: true },
    inventory: [TrainerItem]
});

TrainerSchema.plugin(timestamp);

TrainerSchema.virtual("balance").get(function(this: ITrainerData) {
    return { cash: this.cash, contestCredit: this.contestCredit };
});

TrainerSchema.virtual("balanceString").get(function(this: ITrainerData) {
    return `$${this.cash.toLocaleString()} | ${this.contestCredit.toLocaleString()} CC`;
});

TrainerSchema.methods.cantAfford = function(cash?: number, contestCredit?: number) {
    const cashError = cash && cash > this.cash ? true : false;
    const ccError = contestCredit && contestCredit > this.contestCredit ? true : false;

    return cashError && ccError ? "cash and contest credit" :
        cashError ? "cash" :
            ccError ? "contestCredit" : false;
};

TrainerSchema.methods.modifyCash = async function(amount: number) {
    this.cash += amount;
    return this.save();
};

TrainerSchema.methods.modifyContestCredit = async function(amount: number) {
    this.contestCredit += amount;
    return this.save();
};

TrainerSchema.methods.populatePokemon = async function() {
    return this.populate({
        path: "pokemon",
        populate: {
            path: "basePokemon"
        }
    }).execPopulate();
};

TrainerSchema.methods.getPokemon = async function(index?: number) {
    if (!this.populated("pokemon")) { await this.populatePokemon(); }
    return index !== undefined ? this.pokemon[index] : this.pokemon;
};

TrainerSchema.methods.findPokemon = async function(query: string) {
    if (!this.populated("pokemon")) { await this.populatePokemon(); }
    return this.pokemon.filter((p: any) => {
        return (
            (p.nickname && new RegExp(`^${query}$`, "i").test(p.nickname)) ||
            new RegExp(`^${query}$`, "i").test(p.pokemon.uniqueName)
        );
    });
};

TrainerSchema.methods.listPokemon = async function() {
    if (!this.populated("pokemon")) { await this.populatePokemon(); }
    return this.pokemon.map((p: any) => p.nickname || p.pokemon.uniqueName);
};

// Adds a new TrainerPokemon for the provided Pokemon ID number
// TrainerSchema.methods.addNewPokemon = async function(pokemon: IPokemon) {
// const tp = new TrainerPokemon({
//     trainer: this.id,
//     basePokemon: pokemon.id,
//     moves: { ...pokemon.moves },
//     abilities: { ...pokemon.abilities }
// });

// for (const method in tp.moves) { for (const m of tp.moves[method]) { m.learned = false; } }
// for (const a of tp.abilities) { a.learned = !a.hidden; }

// await tp.save();
// this.pokemon.push(tp.id);
// return this.save();
// };

TrainerSchema.methods.addNewItem = async function(item: IItem, type: string) {
    this.inventory.push({ item: item.id, itemType: type });
    return this.save();
};

export const TrainerData: ITrainerDataModel = instanceDB.model<ITrainerData, ITrainerDataModel>("Model", TrainerSchema);
