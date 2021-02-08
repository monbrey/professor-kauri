import { Document, Model, Schema } from "mongoose";
import { db } from "../../util/db";
export interface IBattleTagDocument extends Document {
  user: string;
  tag?: number;
  schedule: {
    user?: string;
    time?: number;
  };
}

export interface IBattleTag extends IBattleTagDocument { }

export interface IBattleTagModel extends Model<IBattleTag> {
  swap(a: string, b: string): Promise<IBattleTag[]>;
  schedule(a: string, b: string): Promise<IBattleTag[]>;
}

const BattleTagSchema = new Schema<IBattleTag, IBattleTagModel>({
  user: { type: String, required: true, unique: true },
  tag: { type: Number },
  schedule: {
    _id: false,
    user: { type: String },
    time: { type: Number }
  }
}, { collection: "battletags" });

BattleTagSchema.pre("save", function (next) {
  if (this.tag) return next();

  BattleTag.findOne({}).sort({ tag: -1 }).then(doc => {
    this.tag = (doc?.tag ?? 0) + 1;
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

  userA.schedule = {};
  userB.schedule = {};

  await userA.save();
  await userB.save();

  return [userA, userB];
};

BattleTagSchema.statics.schedule = async function (a: string, b: string) {
  const userA = await this.findOne({ user: a });
  const userB = await this.findOne({ user: b });

  if (!userA) throw new Error(`No tag found for <@${a}>`);
  if (!userB) throw new Error(`No tag found for <@${b}>`);

  if(userA.schedule.user) throw new Error(`<@${a}> already has a battle scheduled`);
  if(userB.schedule.user) throw new Error(`<@${b}> already has a battle scheduled`);

  const time = Date.now();

  userA.schedule = { user: b, time };
  userB.schedule = { user: a, time };

  await userA.save();
  await userB.save();

  return [userA, userB];

};

export const BattleTag: IBattleTagModel = db.model<IBattleTag, IBattleTagModel>("BattleTag", BattleTagSchema);
