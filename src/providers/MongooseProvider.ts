import { Provider } from "discord-akairo";
import { Document, Model } from "mongoose";

/**
 * Provider using Mongoose for MongoDB
 * @param {Model} model - Mongoose Model object
 * @param {string} idColumn - Unique column to perform lookups
 * @extends {Provider}
 */
export default class MongooseProvider extends Provider {
    private model: Model<Document>;
    private idColumn: string;

    constructor(model: Model<Document>, idColumn: string) {
        super();

        /**
         * Mongoose Model object
         * @type {Model}
         */
        this.model = model;

        /**
         * Mongoose Model object
         * @type {string}
         */
        this.idColumn = idColumn;

        this.init();
    }

    public init() {
        this.model.find({}).then(docs => {
            for (const d of docs) {
                this.items.set(d.get(this.idColumn), d);
            }
        });
    }

    public has(id: string, key?: string) {
        if (!key) { return this.items.has(id); }

        const item = this.items.get(id);
        return Boolean(item[key]);
    }

    public get(id: string, key?: string) {
        if (this.items.has(id)) {
            const value = key ? this.items.get(id)[key] : this.items.get(id);
            return value;
        }

        return null;
    }

    public getAll(key?: string) {
        return key ? this.items.map(i => i[key]) : this.items;
    }

    public async fetch(id: string, key?: string) {
        const q: { [index: string]: any } = {};
        q[this.idColumn] = id;

        const item = await this.model.findOne(q, `${key}`);
        return item ? (key ? item.get(key) : item) : null;
    }

    public async add(value: any) {
        this.items.set(value[this.idColumn], value);
        return value.save();
    }

    public async set(id: string, key: string, value: any) {
        const item = this.items.get(id) || new this.model();
        const exists = this.items.has(id);

        if (!exists) {
            item[this.idColumn] = id;
        }

        item[key] = value;
        this.items.set(item[id], item);

        return item.save();
    }

    public async delete(id: string, key: string) {
        const data = this.items.get(id);

        if (data) {
            delete data[key];
            return data.save();
        }
    }

    public async clear(id: string) {
        const data: Document = this.items.get(id);
        this.items.delete(id);

        if (data) {
            return data.remove();
        }
    }
}
