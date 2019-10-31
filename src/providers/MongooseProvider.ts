import { Provider } from "discord-akairo";
import { Collection } from "discord.js";
import { Document, Model } from "mongoose";
import strsim from "string-similarity";

// tslint:disable-next-line: interface-over-type-literal
type IMongooseProvider<T> = {
    get(id: string | string[]): T | undefined;
    get(id: string | string[], key?: string): any | undefined;
};

/**
 * Provider using Mongoose for MongoDB
 * @param {Model} model - Mongoose Model object
 * @param {string | string[]} idColumn - Unique column to perform lookups
 * @extends {Provider}
 */
export default class MongooseProvider<T extends Document> extends Provider implements IMongooseProvider<T> {
    private model: Model<T>;
    private idColumn: string | string[];
    private compositeKey: boolean;

    constructor(model: Model<T>, idColumn: string | string[]) {
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

        /**
         * Boolean flag for composite keys
         * @type {boolean}
         */
        this.compositeKey = typeof idColumn === "object" ? true : false;
    }

    public async init() {
        const docs = await this.model.find({});
        for (const d of docs) {
            this.items.set(this.generateKey(d), d);
        }
    }

    public has(id: string, key?: string): boolean {
        if (!key) { return this.items.has(id); }

        const item = this.items.get(id);
        return Boolean(item[key]);
    }

    public get(id: string): T | undefined;
    public get(id: string, key?: string): any | undefined;
    public get(id: string, key?: string) {
        if (this.items.has(id)) {
            const value = key ? this.items.get(id)[key] : this.items.get(id);
            return value;
        }

        return;
    }

    public getClosest(id: string): T | undefined;
    public getClosest(id: string, key?: string): any | undefined;
    public getClosest(id: string, key?: string) {
        const keys = this.items.keyArray();

        const { bestMatch } = strsim.findBestMatch(id, keys);
        const item = this.items.get(bestMatch.target);

        return item ? (key ? item.get(key) : item) : undefined;
    }

    public getAll(): Collection<string, T>;
    public getAll(key?: string): any[];
    public getAll(key?: string) {
        return key ? this.items.map(i => i[key]) : this.items;
    }

    public async fetch(id: string, key?: string, cache: boolean = true): Promise<T> {
        const q = this.deconstructKey(id);

        const item = await (key ? this.model.findOne(q, key) : this.model.findOne(q));
        if (item && cache) this.items.set(this.generateKey(item), item);
        return item ? (key ? item.get(key) : item) : undefined;
    }

    public async fetchClosest(id: string, key?: string, cache: boolean = true): Promise<T> {
        if (this.compositeKey || this.idColumn instanceof Array) {
            throw new TypeError("MongooseProvider#fetchClosest cannot be used with composite keys");
        }

        const item = await this.model.findClosest(this.idColumn, id);
        if (item && cache) this.items.set(this.generateKey(item), item);
        return item ? (key ? item.get(key) : item) : undefined;
    }

    public async resolve(id: string, key?: string, cache: boolean = true) {
        return this.items.has(id) ? this.get(id, key) : this.fetch(id, key, cache);
    }

    public async resolveClosest(id: string, key?: string, cache: boolean = true) {
        return this.items.has(id) ? this.get(id, key) : this.fetchClosest(id, key, cache);
    }

    public async add(value: T): Promise<T> {
        this.items.set(this.generateKey(value), value);
        return value.save();
    }

    public async set(id: string, key: string, value: any): Promise<T> {
        const item = this.items.get(id) || this.deconstructKey(id);

        item[key] = value;

        const q = this.deconstructKey(id);
        await (this.items.has(id) ? this.model.findOneAndUpdate(q, item) : this.add(item));
        return item;
    }

    public async delete(id: string, key: string): Promise<T | undefined> {
        const data = this.items.get(id);

        if (data) {
            delete data[key];
            return data.save();
        }

        return;
    }

    public async clear(id: string): Promise<T | undefined> {
        const data = this.items.get(id);
        this.items.delete(id);

        if (data) {
            return data.remove();
        }

        return;
    }

    private generateKey(value: any) {
        if (this.compositeKey) {
            return (this.idColumn as string[]).map(k => value[k]).join(":");
        }

        return value[this.idColumn as string];
    }

    private deconstructKey(id: string) {
        const d: { [index: string]: any } = {} as T;

        if (!this.compositeKey) {
            d[this.idColumn as string] = id;
        } else {
            const params = id.split(":");
            // tslint:disable-next-line: forin
            for (const index in params) {
                d[this.idColumn[index]] = params[index];
            }
        }

        return d;
    }
}

const Providers: Array<MongooseProvider<Document>> = [];
