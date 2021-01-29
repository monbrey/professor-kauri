import { stripIndents } from "common-tags";
import { MessageEmbed } from "discord.js";
import { Document, Model, Schema } from "mongoose";
import { autoIncrement } from "mongoose-plugin-autoinc";
import { db } from "../../util/db";
import { Color } from "./color";


export interface IMoveDocument extends Document {
  moveName: string;
  moveType: string;
  desc?: string;
  power?: number;
  accuracy?: number;
  pp: number;
  category: string;
  contact?: boolean;
  sheerForce?: boolean;
  substitute?: boolean;
  snatch?: boolean;
  magicCoat?: boolean;
  list?: any[];
  additional?: string;
  note?: string;
  zmove?: string;
  maxmove?: string;
  metronome: boolean;
  tm?: {
    number: number;
    price: number;
  };
  hm?: {
    number: number;
    price: number;
  };
}

export interface IMove extends IMoveDocument {
  info(): Promise<MessageEmbed>;
}

export interface IMoveModel extends Model<IMove> {
  metronome(): IMove;
}

const MoveSchema = new Schema<IMove, IMoveModel>({
  moveName: { type: String, required: true },
  moveType: { type: String, reuqired: true },
  desc: { type: String },
  power: { type: Number },
  accuracy: { type: Number },
  pp: { type: Number, required: true },
  category: { type: String, required: true },
  contact: { type: Boolean },
  sheerForce: { type: Boolean },
  substitute: { type: Boolean },
  snatch: { type: Boolean },
  magicCoat: { type: Boolean },
  list: { type: Array },
  additional: { type: String },
  note: { type: String },
  zmove: { type: String },
  maxmove: { type: String },
  metronome: { type: Boolean, default: true },
  tm: {
    number: { type: Number },
    price: { type: Number },
  },
  hm: {
    number: { type: Number },
    price: { type: Number },
  }
}, { collection: "moves" });

MoveSchema.plugin(autoIncrement, {
  model: "Move",
  startAt: 1
});

MoveSchema.statics.metronome = async function () {
  const move = await this.aggregate([{ $match: { metronome: true } }, { $sample: { size: 1 } }]);

  return new this(move[0]);
};

MoveSchema.methods.info = async function () {
  console.log(this.tm);
  const type = `Type: ${this.moveType}`;
  const power = `Power: ${this.power ? this.power : "-"}`;
  const acc = `Accuracy: ${this.accuracy ? this.accuracy : "-"}`;
  const pp = `PP: ${this.pp}`;
  const cat = `Category: ${this.category}`;
  const contact = this.contact ? "Makes contact. " : "";
  const sf = this.sheerForce ? "Boosted by Sheer Force. " : "";
  const sub = this.substitute ? "Bypasses Substitute. " : "";
  const snatch = this.snatch ? "Can be Snatched. " : "";
  const mc = this.magicCoat ? "Can be reflected by Magic Coat. " : "";

  const propString = stripIndents`| ${type} | ${power} | ${acc} | ${pp} | ${cat} |

    ${this.desc}

    ${contact}${sf}${sub}${snatch}${mc}`;

  const embed = new MessageEmbed()
    .setTitle(this.moveName)
    .setDescription(propString)
    .setColor(await Color.getColorForType(this.moveType.toLowerCase()));

  if (this.note) embed.addField("**Note**", this.note);
  if (this.additional) embed.addField("**Additional note**", this.additional);
  if (this.list && this.list.length !== 0) embed.addField("**Helpful data**", this.list.join("\n"));
  if (this.tm?.number) {
    const tmNum = this.tm.number.toString().padStart(2, "0");
    const tmPrice = this.tm.price.toLocaleString();
    embed.addField("**TM**", `Taught by TM${tmNum} ($${tmPrice})`);
  }
  if (this.hm?.number) {
    const tmNum = this.hm.number.toString().padStart(2, "0");
    const tmPrice = this.hm.price.toLocaleString();
    embed.addField("**HM**", `Taught by HM${tmNum} ($${tmPrice})`);
  }

  if (this.zmove) embed.addField("**Z-Move**", this.zmove);
  if (this.maxmove) embed.addField("**Dynamax Move**", this.maxmove);

  return embed;
};

export const Move: IMoveModel = db.model<IMove, IMoveModel>("Move", MoveSchema);
