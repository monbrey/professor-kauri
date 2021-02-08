import { Message, Snowflake } from "discord.js";
import { Document, Model, Schema } from "mongoose";
import { db } from "../../util/db";

interface IDiceLogDocument extends Document {
  message_id: Snowflake;
  user_id: Snowflake;
  username: Snowflake;
  channel_id?: Snowflake;
  channel?: string;
  guild_id?: Snowflake;
  guild: string;
  input: string;
  result: string;
}

export interface IDiceLog extends IDiceLogDocument {
}

export interface IDiceLogModel extends Model<IDiceLogDocument> {
  log: (id: Snowflake, message: Message, result: string) => Promise<IDiceLog>;
}

const DiceLogSchema = new Schema<IDiceLog, IDiceLogModel>({
  message_id: { type: String, required: true },
  user_id: { type: String, required: true },
  username: { type: String, required: true },
  channel_id: { type: String },
  channel: { type: String },
  guild_id: { type: String },
  guild: { type: String },
  input: { type: String, required: true },
  result: { type: String, required: true }
}, { timestamps: true });

DiceLogSchema.statics.log = async function (id: Snowflake, message: Message, result: string): Promise<IDiceLog> {
  return this.create({
    message_id: id,
    channel_id: message.guild ? message.channel.id : undefined,
    channel: message.channel.type !== "dm" ? message.channel.name : undefined,
    guild_id: message.guild?.id,
    guild: message.guild?.name,
    user_id: message.author.id,
    username: message.author.tag,
    input: message.content,
    result
  });
};

export const DiceLog: IDiceLogModel = db.model<IDiceLog, IDiceLogModel>("DiceLog", DiceLogSchema);
