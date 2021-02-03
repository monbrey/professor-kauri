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
  tag: { type: Number },
}, { collection: "battletags" });

BattleTagSchema.pre("save", function(next) {
  if(this.tag) return next();

  BattleTag.findOne({}).sort({ tag: -1 }).then(doc => {
    this.tag = (doc?.tag ?? 0)+1;
    next();
  });
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
