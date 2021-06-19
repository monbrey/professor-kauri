import { oneLine } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import { Document, Model, model, Schema } from 'mongoose';

// Import { paginate } from "./plugins/paginator";

export interface IItemDocument extends Document {
  _id: number;
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

const ItemSchema = new Schema<IItem, IItemModel>(
  {
    _id: { type: Number, required: true },
    itemName: { type: String, required: true },
    desc: { type: String },
    category: [{ type: String }],
    martPrice: {
      pokemart: { type: Number },
      berryStore: { type: Number },
    },
  },
  { collection: 'items' },
);

function getPriceString(doc: IItemDocument): string {
  if (doc.martPrice?.pokemart && doc.martPrice.berryStore) {
    return oneLine`
    Pokemart: ${doc.martPrice.pokemart.toLocaleString()} | 
    Berry Store: ${doc.martPrice.berryStore.toLocaleString()} CC`;
  }
  if (doc.martPrice?.pokemart) {
    return `Pokemart: ${doc.martPrice.pokemart.to$()}`;
  }
  if (doc.martPrice?.berryStore) {
    return `Berry Store: ${doc.martPrice.berryStore.to$()}`;
  }

  return '';
}

ItemSchema.virtual('priceString').get(getPriceString);

ItemSchema.statics.findExact = async function findExact(itemNames: string[], query: any = {}): Promise<IItem[] | null> {
  const itemRes = itemNames.map(name => new RegExp(`^${name}$`, 'i'));
  const item = await this.find(
    Object.assign(query, {
      itemName: {
        $in: itemRes,
      },
    }),
  );
  return item;
};

ItemSchema.statics.findPartial = async function findPartial(itemName: string): Promise<IItem[] | null> {
  const item = await this.find({
    itemName: new RegExp(itemName, 'i'),
  });
  return item;
};

ItemSchema.methods.info = function info(): MessageEmbed {
  const embed = new MessageEmbed().setTitle(this.itemName).setDescription(this.desc ?? '');

  if (this.priceString) embed.addFields({ name: '**Mart Price**', value: this.priceString });

  return embed;
};

export const Item: IItemModel = model<IItem, IItemModel>('Item', ItemSchema);
