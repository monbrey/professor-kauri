import { HexColorString, MessageEmbed } from 'discord.js';
import { Document, Model, Schema } from 'mongoose';
import { db } from '../../util/db';

export interface IStatusEffectDocument extends Document {
  _id: number;
  statusName: string;
  shortCode: string;
  desc: string;
  color: HexColorString;
}

export interface IStatusEffect extends IStatusEffectDocument {
  info(): MessageEmbed;
}

export interface IStatusEffectModel extends Model<IStatusEffect> {}

const StatusEffectSchema = new Schema<IStatusEffect, IStatusEffectModel>(
  {
    _id: { type: Number, required: true },
    statusName: { type: String, required: true },
    shortCode: { type: String, required: true },
    desc: { type: String, required: true },
    color: { type: String, required: true },
  },
  { collection: 'statuseffects' },
);

StatusEffectSchema.methods.info = function info(): MessageEmbed {
  const embed = new MessageEmbed()
    .setTitle(`${this.statusName} (${this.shortCode})`)
    .setDescription(this.desc)
    .setColor(this.color);

  return embed;
};

export const StatusEffect: IStatusEffectModel = db.model('StatusEffect', StatusEffectSchema);
