import { Document, Model, Schema } from "mongoose";
import { autoIncrement } from "mongoose-plugin-autoinc";
import { db } from "../../util/db";

export interface IEotDocument extends Document {
  _id: number;
  order: number;
  effect: string;
}

export interface IEot extends IEotDocument {

}

export interface IEotModel extends Model<IEot> {
  getSurrounding(num: number): IEot[];
}

const EotSchema = new Schema<IEot, IEotModel>({
  _id: { type: Number, required: true },
  order: { type: Number, required: true },
  effect: { type: String, required: true }
}, { collection: "eotEffects" });

EotSchema.statics.getSurrounding = async function(num: number) {
  const effects = await this.find({
    order: {
      $gt: Math.floor(num) - 3,
      $lt: Math.floor(num) + 3
    }
  }).sort("order");

  return effects;
};

export const Eot: IEotModel = db.model<IEot, IEotModel>("EOT", EotSchema);
