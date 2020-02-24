import { stripIndents } from "common-tags";
import { MessageEmbed } from "discord.js";
import { Document, Model, Schema } from "mongoose";
import { autoIncrement } from "mongoose-plugin-autoinc";
import { db } from "../../util/db";
import { Color } from "../color";
import { IPokemon } from "./pokemon";


export interface IMegaDocument extends Document {
    displayName: string;
    ability: {
        abilityId: number;
        abilityName: string;
    };
    type1: string;
    type2?: string;
    stats: {
        [index: string]: number;
        attack: number;
        defence: number;
        specialAttack: number;
        specialDefence: number;
        speed: number;
    };
    height?: number;
    weight?: number;
    spriteCode?: string;
}

export interface IMega extends IMegaDocument {
    dex(base: IPokemon): MessageEmbed;
}

export interface IMegaModel extends Model<IMega> {

}

const MegaSchema = new Schema({
    displayName: { type: String, required: true },
    ability: {
        abilityId: { type: Number, required: true },
        abilityName: { type: String, required: true }
    },
    type1: { type: String, required: true },
    type2: { type: String },
    stats: {
        attack: { type: Number, required: true },
        defence: { type: Number, required: true },
        specialAttack: { type: Number, required: true },
        specialDefence: { type: Number, required: true },
        speed: { type: Number, required: true }
    },
    height: { type: Number },
    weight: { type: Number },
    spriteCode: { type: String }
}, { collection: "megas" });

MegaSchema.plugin(autoIncrement, {
    model: "Mega",
    startAt: 1
});

MegaSchema.methods.dex = async function (base: IPokemon) {
    const color = await Color.getColorForType(this.type1.toLowerCase());
    const dexString = base.dexNumber.toString().padStart(3, "0");
    const title = `URPG Ultradex - ${this.displayName} (#${dexString})`;

    const stats: number[] = Object.values({ hp: base.stats.hp, ...this.stats.toObject() });

    const embed = new MessageEmbed()
        .setTitle(title)
        .setColor(color)
        .setImage(
            `https://pokemonurpg.com/img/models/${base.dexNumber}-${this.spriteCode || "mega"}.gif`
        )
        .addFields([{
            name: `${this.type2 ? "Types" : "Type"}`,
            value: `${this.type1}${this.type2 ? ` | ${this.type2}` : ""}`
        }, {
            name: "**Ability**",
            value: `${this.ability.abilityName}`
        }, {
            name: "**Height and Weight**",
            value: `${this.height}m, ${this.weight}kg`
        }, {
            name: "**Stats**",
            value: `\`\`\`${stripIndents`HP   | ATT  | DEF  | SP.A | SP.D | SPE
            ${stats.map(s => s.toString().padEnd(4, " ")).join(" | ")}`}\`\`\``
        }]);

    return embed;
};

export const Mega: IMegaModel = db.model<IMega, IMegaModel>("Mega", MegaSchema);
