import { Document, Model, Schema } from "mongoose";
import { autoIncrement } from "mongoose-plugin-autoinc";
import { db } from "../../util/db";

export interface IColorDocument extends Document {
  _id: number;
  key: string;
  color: string;
}

export interface IColor extends IColorDocument {
}

export interface IColorModel extends Model<IColorDocument> {
  getColorForType(type: string): Promise<string>;
}

const ColorSchema = new Schema<IColor, IColorModel>({
  _id: { type: Number, required: true },
  key: { type: String, required: true },
  color: { type: String, required: true }
}, { collection: "colors" });

ColorSchema.statics.getColorForType = async function(type: string) {
  const colors = await this.find({});
  const pair = colors.find((c: IColorDocument) => c.key === type);
  if (pair) { return pair.color; } else { return "0x000000"; }
};

export const Color: IColorModel = db.model<IColor, IColorModel>("Color", ColorSchema);
