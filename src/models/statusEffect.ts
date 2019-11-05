import { MessageEmbed } from "discord.js";
import { connection, Document, Model, Schema } from "mongoose";
import { autoIncrement } from "mongoose-plugin-autoinc";
import { db } from "../util/db";

export interface IStatusEffectDocument extends Document {
    statusName: string;
    shortCode: string;
    desc: string;
    color: string;
}

export interface IStatusEffect extends IStatusEffectDocument {
    info(): MessageEmbed;
}

export interface IStatusEffectModel extends Model<IStatusEffect> {

}

const StatusEffectSchema = new Schema({
    statusName: { type: String, required: true },
    shortCode: { type: String, required: true },
    desc: { type: String, required: true },
    color: { type: String, required: true }
}, { collection: "statuseffects" });

StatusEffectSchema.plugin(autoIncrement, {
    model: "StatusEffect",
    startAt: 1
});

StatusEffectSchema.methods.info = async function() {
    const embed = new MessageEmbed()
        .setTitle(`${this.statusName} (${this.shortCode})`)
        .setDescription(this.desc)
        .setColor(this.color);

    return embed;
};

export const StatusEffect: IStatusEffectModel = db.model("StatusEffect", StatusEffectSchema);
