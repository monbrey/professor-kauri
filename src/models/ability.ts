import { MessageEmbed } from "discord.js";
import { Document, Model, Schema } from "mongoose";
import { autoIncrement } from "mongoose-plugin-autoinc";
import { db } from "../util/db";

export interface IAbilityDocument extends Document {
    abilityName: string;
    announcement?: string;
    desc: string;
    additional: string;
    affects: string;
}

export interface IAbility extends IAbilityDocument {
    info(): MessageEmbed;
}

export interface IAbilityModel extends Model<IAbility> {

}

const AbilitySchema: Schema = new Schema({
    abilityName: { type: String, required: true },
    announcement: { type: String },
    desc: { type: String },
    additional: { type: String },
    affects: { type: String }
}, { collection: "abilities" });

AbilitySchema.plugin(autoIncrement, {
    model: "Ability",
    startAt: 1
});

AbilitySchema.methods.info = function () {
    const embed = new MessageEmbed()
        .setDescription(this.desc);

    switch (this.announcement) {
        case "Active":
            embed.setTitle(`${this.abilityName} | Announced on activation`);
            break;
        case "Enter":
            embed.setTitle(`${this.abilityName} | Announced on entry`);
            break;
        case "Hidden":
            embed.setTitle(`${this.abilityName} | Hidden`);
            break;
        default:
            embed.setTitle(`${this.abilityName}`)
    }

    if (this.affects) embed.addFields({ name: "**Interacts with**", value: this.affects });
    if (this.additional) embed.addFields({ name: "**Additional information**", value: this.additional });

    return embed;
};

export const Ability: IAbilityModel = db.model<IAbility, IAbilityModel>("Ability", AbilitySchema);
