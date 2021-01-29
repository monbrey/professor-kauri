import { Document, Model, Schema } from "mongoose";
import { autoIncrement } from "mongoose-plugin-autoinc";
import { db } from "../../util/db";

export interface IBattleTagDocument extends Document {
  user: string;
  tag?: number;
}

export interface IBattleTag extends IBattleTagDocument { }

export interface IBattleTagModel extends Model<IBattleTag> {
  swap(a: string, b: string): Promise<IBattleTag[]>;
}

const BattleTagSchema = new Schema<IBattleTag, IBattleTagModel>({
  user: { type: String, required: true, unique: true },
  tag: { type: Number, required: true },
}, { collection: "battletags" });

BattleTagSchema.plugin(autoIncrement, {
  model: "BattleTag",
  field: "tag",
  startAt: 1
});

BattleTagSchema.statics.swap = async function (a: string, b: string) {
  const userA = await this.findOne({ user: a });
  const userB = await this.findOne({ user: b });

  if (!userA || !userB) return [];

  const temp = userA.tag;
  userA.tag = userB.tag;
  userB.tag = temp;

  await userA.save();
  await userB.save();

  return [userA, userB];
};

export const BattleTag: IBattleTagModel = db.model<IBattleTag, IBattleTagModel>("BattleTag", BattleTagSchema);
