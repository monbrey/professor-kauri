import { MessageEmbed } from "discord.js";
import { Document, Model, model, Schema } from "mongoose";
import { autoIncrement } from "mongoose-plugin-autoinc";

// import { paginate } from "./plugins/paginator";

export interface IItemDocument extends Document {
  itemName: string;
  desc?: string;
  category?: string[];
  martPrice?: {
    pokemart?: number;
    berryStore?: number;
  };
  priceString: string;
}

export interface IItem extends IItemDocument {
  info(): MessageEmbed;
}

export interface IItemModel extends Model<IItem> {
  findExact(itemNames: string[], query: any): IItemDocument[];
  findPartial(itemName: string): IItemDocument[];
}

const ItemSchema = new Schema({
  itemName: { type: String, required: true },
  desc: { type: String },
  category: [{ type: String }],
  martPrice: {
    pokemart: { type: Number },
    berryStore: { type: Number }
  }
}, { collection: "items" });

ItemSchema.plugin(autoIncrement, {
  model: "Item",
  startAt: 1
});
// ItemSchema.plugin(paginate);

ItemSchema.virtual("priceString").get(function(this: IItemDocument) {
  if (!this.martPrice) { return ""; }
  if (this.martPrice.pokemart && this.martPrice.berryStore) {
    return `Pokemart: ${this.martPrice.pokemart.toLocaleString()} | Berry Store: ${this.martPrice.berryStore.toLocaleString()} CC`;
  }
  if (this.martPrice.pokemart) { return `Pokemart: ${this.martPrice.pokemart.to$()}`; }
  if (this.martPrice.berryStore) { return `Berry Store: ${this.martPrice.berryStore.to$()}`; }
});

ItemSchema.statics.findExact = function(itemNames: string[], query: any = {}) {
  const itemRes = itemNames.map(name => new RegExp(`^${name}$`, "i"));
  return this.find(
    Object.assign(query, {
      itemName: {
        $in: itemRes
      }
    })
  );
};

ItemSchema.statics.findPartial = function(itemName: string) {
  return this.find({
    itemName: new RegExp(itemName, "i")
  });
};

ItemSchema.methods.info = function() {
  const embed = new MessageEmbed().setTitle(this.itemName).setDescription(this.desc);

  if (this.priceString) embed.addFields({ name: "**Mart Price**", value: this.priceString });

  return embed;
};

export const Item: IItemModel = model<IItem, IItemModel>("Item", ItemSchema);
