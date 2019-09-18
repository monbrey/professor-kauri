import { MessageEmbed } from "discord.js";
import { connection, Document, Model, Schema } from "mongoose";
import { autoIncrement } from "mongoose-plugin-autoinc";

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

// tslint:disable-next-line: only-arrow-functions
AbilitySchema.methods.info = function() {
    const embed = new MessageEmbed()
    .setDescription(this.desc);

    if (this.announcement) {
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
        }
    }

    if (this.affects) {
        embed.addField("Interacts with", this.affects);
    }
    if (this.additional) {
        embed.setFooter(this.additional);
    }

    return embed;
};

const db = connection.useDb("monbrey-urpg-v2");
export const Ability: IAbilityModel = db.model<IAbility, IAbilityModel>("Ability", AbilitySchema);
