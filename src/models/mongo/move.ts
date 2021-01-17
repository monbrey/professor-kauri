import { stripIndents } from "common-tags";
import { MessageEmbed } from "discord.js";
import { Document, Model, Schema } from "mongoose";
import { autoIncrement } from "mongoose-plugin-autoinc";
import { db } from "../../util/db";
import { Color } from "../color";


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
  metronome: boolean;
  tm?: {
    number: number;
    martPrice: {
      pokemart: number;
      berryStore?: number;
    };
  };
  hm?: {
    number: number;
    martPrice: {
      pokemart: number;
      berryStore?: number;
    };
  };
}

export interface IMove extends IMoveDocument {
  info(): Promise<MessageEmbed>;
}

export interface IMoveModel extends Model<IMove> {
  metronome(): IMove;
}

const MoveSchema = new Schema({
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
  metronome: { type: Boolean, default: true },
  tm: {
    number: { type: Number },
    martPrice: {
      pokemart: { type: Number },
      berryStore: { type: Number }
    }
  },
  hm: {
    number: { type: Number },
    martPrice: {
      pokemart: { type: Number },
      berryStore: { type: Number }
    }
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

  if (this.note) embed.addFields({ name: "**Note**", value: this.note });
  if (this.additional) embed.addFields({ name: "**Additional note**", value: this.additional });
  if (this.list && this.list.length !== 0) embed.addFields({ name: "**Helpful data**", value: this.list.join("\n") });
  if (this.tm.number && this.tm.martPrice) {
    const tmNum = this.tm.number.toString().padStart(2, 0);
    const tmPrice = this.tm.martPrice.pokemart.toLocaleString();
    embed.addFields({ name: "**TM**", value: `Taught by TM${tmNum} ($${tmPrice})` });
  }

  if (this.zmove) embed.addFields({ name: "**Z-Move**", value: this.zmove });

  return embed;
};

export const Move: IMoveModel = db.model<IMove, IMoveModel>("Move", MoveSchema);
